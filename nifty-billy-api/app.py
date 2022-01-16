from flask import Flask, jsonify
import pandas as pd
import requests
from datetime import datetime
from flask_cors import CORS

def remove_duplicates(l):
    return list(set(l))

def unpack(df, column, fillna="N/A"):
    ret = None
    if fillna is None:
        tmp = pd.DataFrame((d for idx, d in df[column].iteritems()))
        ret = pd.concat([df.drop(column,axis=1), tmp], axis=1)
    else:
        tmp = pd.DataFrame((d for idx, d in 
        df[column].iteritems())).fillna(fillna)
        ret = pd.concat([df.drop(column,axis=1), tmp], axis=1)
    return ret

def convertToDate(data):
    return datetime.utcfromtimestamp(int(data)).strftime('%Y-%m-%d')

def convertToDateFormat(data):
    return datetime.utcfromtimestamp(int(data)).strftime('%m-%d-%Y')


app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return "Your Nifty Billy App Works!"


@app.route("/api/nft/<address>")
def nftlist(address):
    url = f"https://api.opensea.io/api/v1/events?account_address={address}&limit=300"
    tx_url = f"https://api.etherscan.io/api?module=account&action=txlist&address={address}&sort=asc&apikey=FKRKV4CZ9A6QGRZRYE5APJV3TP8JPVJIPT"
    token_url = f"https://api.etherscan.io/api?module=account&action=tokennfttx&address={address}&sort=asc&apikey=FKRKV4CZ9A6QGRZRYE5APJV3TP8JPVJIPT"

    response = requests.get(tx_url)
    data = response.json()
    txlist_df = pd.DataFrame(data["result"])
    response = requests.get(token_url)
    data = response.json()
    tokennfttx_df = pd.DataFrame(data["result"])
    headers = {
            "Accept": "application/json",
            "X-API-KEY": "b5e38a68201b473d8a4451dd894d1f03"
    }

    response = requests.request("GET", url, headers=headers).json()

    event_df = pd.DataFrame(response["asset_events"])
    transaction_hash_list = []
    event_df = event_df[~event_df['transaction'].isna()]
    for index, row in event_df.reset_index().iterrows():
        transaction_hash_list.append(row["transaction"]["transaction_hash"])
    event_df["hash"] = transaction_hash_list
    event_df.reset_index( inplace = True, col_level = 1)
    t_df = tokennfttx_df.merge(event_df, left_on='hash', right_on='hash')
    test_df = t_df[["tokenName", "tokenID", 'tokenSymbol', "asset", 'total_price', 'timeStamp', 'gas', 'gasPrice', 'gasUsed',
        "event_type",'contractAddress', 'dev_seller_fee_basis_points', "from", "to",  "winner_account"]].fillna(0)
    mint_df = test_df[test_df["from"] == "0x0000000000000000000000000000000000000000"]
    bought_df = test_df[(test_df["to"] == address.lower()) & (test_df["total_price"].astype(int) > 0) ] 
    sale_df = test_df[(test_df["to"] != address.lower()) & (test_df["total_price"].astype(int) > 0) ] 

    sale_df.reset_index( inplace = True, col_level = 1)
    sale_df = unpack(sale_df,"winner_account")

    bought_df.reset_index( inplace = True, col_level = 1)
    bought_df = unpack(bought_df,"winner_account")

    mint_df.reset_index( inplace = True, col_level = 1)
    mint_df = unpack(mint_df, "winner_account")

    mint_df["type"] = "mint"
    bought_df["type"] = "buy"
    sale_df["type"] = "sell"

    opensea_df = pd.concat([mint_df, sale_df, bought_df], ignore_index=True, sort=False).sort_values(by="timeStamp")

    df1 = pd.DataFrame(opensea_df.groupby(["timeStamp", "tokenSymbol", "type"])["tokenID"].apply(remove_duplicates)).reset_index()
    opensea_df = pd.merge(df1,opensea_df.drop_duplicates(subset=['timeStamp'], keep='last').reset_index(),how="inner", on="timeStamp")
    opensea_df = opensea_df.drop(columns=[0, 'config', "level_0", "index", "event_type"]) 
    opensea_df = opensea_df[["timeStamp", "tokenSymbol_x", "type_x", "tokenID_x", "gas", "asset", "total_price", "gasUsed", "gasPrice",  "contractAddress", "user", "from", "to", "profile_img_url", "address",  "dev_seller_fee_basis_points"]]

    headers = { 'Authorization':'Authorization: Bearer '}  
    price = []
    dates = []
    for i in range(len(opensea_df["timeStamp"])):
        query = {'date': opensea_df["timeStamp"].apply(convertToDate)[i] }
        dates.append(opensea_df["timeStamp"].apply(convertToDateFormat)[i])
        response = requests.get('https://api.coinbase.com/v2/prices/ETH-USD/spot', params=query,headers=headers)
        if response.status_code==200:
            data = response.json()
            ethUSDPrice = float(data['data']['amount'])
            price.append(ethUSDPrice)
        else:
            break

    
    price_df = pd.DataFrame({ "ETHtoUSD": price, "date": dates})
    df_cleaned = pd.merge(price_df, opensea_df, left_index=True, right_index=True)
    df_cleaned["gasPriceETH"] = (opensea_df["gasPrice"].astype(int) * opensea_df["gasUsed"].astype(int)/1000000000000000000) 
    df_cleaned["salePriceETH"] = (opensea_df["total_price"].astype(int)/1000000000000000000)
    #df_cleaned["salePriceUSD"] = (opensea_df["salePriceETH"].astype(int) * opensea_df["ETHtoUSD"].astype(float))
    df_cleaned["gasPriceUSD"] = (df_cleaned["gasPriceETH"].astype(int) * df_cleaned["ETHtoUSD"])
    df_cleaned["salePriceUSD"] = (df_cleaned["salePriceETH"].astype(float) * df_cleaned["ETHtoUSD"].astype(float))

    df_cleaned["profile_img_url"] = df_cleaned["profile_img_url"].fillna("None")
    df_cleaned["address"] = df_cleaned["address"].fillna("None")
    image_url_list = []
    name_list = []
    for i, row in df_cleaned.iterrows():
        if(row["asset"]):
            image_url_list.append(row["asset"]["image_url"])
            name_list.append(row["asset"]["name"])
        else: 
            image_url_list.append("None")
            name_list.append("None")
    df_cleaned["nft_collection_name"] = name_list
    df_cleaned["nft_image_url"] = image_url_list
    df_cleaned["royaltyFee"] = df_cleaned["dev_seller_fee_basis_points"]/10000
    df_cleaned["royaltyFeeUSD"] = df_cleaned["salePriceUSD"] *  df_cleaned["royaltyFee"]
    df_cleaned["royaltyFeeETH"] = df_cleaned["salePriceETH"] *  df_cleaned["royaltyFee"]
    df_cleaned["openSeaFeeETH"] = df_cleaned["salePriceETH"] *  0.025
    df_cleaned["openSeaFeeUSD"] = df_cleaned["salePriceUSD"] *  0.025
    return jsonify( { "data" :    df_cleaned[["date", "nft_collection_name", "tokenSymbol_x", "timeStamp",  "type_x", "tokenID_x", "gasUsed",
                "gasPrice", "contractAddress", "from", "to", "address", "gasPriceETH", "salePriceETH",
                "gasPriceUSD", "salePriceUSD", "nft_image_url", "royaltyFee", "royaltyFeeUSD", "royaltyFeeETH", "ETHtoUSD", "openSeaFeeUSD", "openSeaFeeETH" ]].to_dict("records") }) 

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)