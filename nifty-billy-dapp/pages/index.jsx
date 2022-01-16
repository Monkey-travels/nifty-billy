import { useEthers } from '@usedapp/core'
import Davatar from '@davatar/react';
import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled';
import axios from 'axios';
import Link from 'next/link'
import Chart from 'chart.js/auto'
import { Bar, Doughnut } from 'react-chartjs-2';

const Button = styled.button`
    color: white;
    box-shadow: 0 10px 20px -10px #253078;
    width: 200px;
    height: 50px;
    font-size: 1em;
    border-radius: 60px;
    border: none;
    cursor: pointer;
    font-family: Nunito;
    font-weight: 800;
    background: linear-gradient(135deg, #FF3366, #CB5EEE, #ee7752,   #FFCC33, #00B3CC,  #E233FF, #23a6d5);
    transition-timing-function: cubic-bezier(.4,0,.2,1);
    transition-duration: .15s;
    transition-property: all;
    animation: gradient 20s ease infinite;
    background-size: 400% 400%;
    &:hover {
        background-color: rgb(254, 159, 53, 0.9);
        transform: translateX(0) translateY(0) rotate(0) skewX(0) skewY(0) scaleX(1.05) scaleY(1.05);
    }
    @keyframes gradient  {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
      }
`
const UnitButton = styled.button`
    padding: 10px 20px;
    color: #fff;
    border-radius: 3px;
    font-size: 0.9rem;
    cursor: pointer;
    background: linear-gradient(135deg, #FF3366, #CB5EEE, #ee7752,   #FFCC33, #00B3CC,  #E233FF, #23a6d5);
    transition-timing-function: cubic-bezier(.4,0,.2,1);
    transition-duration: .15s;
    transition-property: all;
    animation: gradient 20s ease infinite;
    background-size: 400% 400%;
    border: 0px solid;

    &:hover {
        background-color: rgb(254, 159, 53, 0.9);
        transform: translateX(0) translateY(0) rotate(0) skewX(0) skewY(0) scaleX(1.05) scaleY(1.05);
    }
    @keyframes gradient  {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
      }

`


const Tag = styled.div`
	padding: 16px 10px;
    border-radius:3px;
    text-align: center;
    display: grid;
	outline: 1px solid #00000022;
    
    .tag.mint{
        padding: 10px 20px;
        background-color: #00b712;
        background-image: linear-gradient(315deg, #00b712 0%, #5aff15 74%);
        color: #fff;
        border-radius: 3px;
        font-size: 0.9rem;
    }

    .tag.buy {
        padding: 10px 20px;
        background-color: #2a2a72;
        background-image: linear-gradient(315deg, #2a2a72 0%, #009ffd 74%);
        color: #fff;
        border-radius: 3px;
        font-size: 0.9rem;
    }

    .tag.sell {
        padding: 10px 20px;
        background-color: #f7b42c;
        background-image: linear-gradient(315deg, #f7b42c 0%, #fc575e 74%);
        color: #fff;
        border-radius: 3px;
        font-size: 0.9rem;
    }
`



const Home = () => {
    const { activateBrowserWallet, account } = useEthers()
    const [items, setItems] = useState()
    const [event, setEvent] = useState("all")
    const [units, setUnits] = useState(true)
    const [loading, setLoading] = useState(true)

    useEffect(async () => {
        let url = `https://nft-service.ql137g6apidrm.us-west-2.cs.amazonlightsail.com/api/nft/${account}`
        if (account) {
            axios.get(url).then(response => {
                setLoading(false)
                setItems(response);
                setLoading(true)
                console.log(response)
            });
        }



    }, [account])

    const selectChange = (event) => {
        const value = event.target.value;
        setEvent(value);
    };

    const calculateUSD = (data) => {
        if (data["type_x"] == "buy") {
                return ((data["salePriceETH"] + data["gasPriceETH"]) * data["ETHtoUSD"])
        }
        else if (data["type_x"] == "mint") {
                return ((data["salePriceETH"] + data["gasPriceETH"]) * data["ETHtoUSD"])
        }
        else if (data["type_x"] == "sell") {
                return ((data["salePriceETH"] - data["openSeaFeeETH"] - data["royaltyFeeETH"] - data["gasPriceETH"]) * data["ETHtoUSD"])
        }

    }


    const calculateTotal = (data) => {
        if (data["type_x"] == "buy") {
            if (units) {
                return "Ξ" + (data["salePriceETH"] + data["gasPriceETH"]).toFixed(4) + " Paid"
            } else {
                return `$${((data["salePriceETH"] + data["gasPriceETH"]) * data["ETHtoUSD"]).toFixed(2)}` + " Paid"

            }
        }
        else if (data["type_x"] == "mint") {
            if (units) {
                return "Ξ" + (data["salePriceETH"] + data["gasPriceETH"]).toFixed(4) + " Paid"
            } else {
                return `$${((data["salePriceETH"] + data["gasPriceETH"]) * data["ETHtoUSD"]).toFixed(2)}` + " Paid"
            }
        }
        else if (data["type_x"] == "sell") {
            if (units) {
                return "Ξ" + (data["salePriceETH"] - data["openSeaFeeETH"] - data["royaltyFeeETH"] - data["gasPriceETH"]).toFixed(4) + " Received"
            }
            else {
                return "$" + ((data["salePriceETH"] - data["openSeaFeeETH"] - data["royaltyFeeETH"] - data["gasPriceETH"]) * data["ETHtoUSD"]).toFixed(2) + " Received"
            }

        }
        else {
            return ""
        }
    }




    return (
        <section>
            <header style={{ backgroundColor: "#1D2732", height: "100px", padding: "15px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", justifyItems: "center", alignItems: "center" }}>
                    <div >

                        <svg width="100px" height="100px" viewBox="0 0 125 121" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <defs>
                                <linearGradient x1="2.13603921%" y1="4.01437786%" x2="100%" y2="95.9856221%" id="linearGradient-btagpxx67n-1">
                                    <stop stop-color="#B5E6F0" offset="0%"></stop>
                                    <stop stop-color="#7EC9DC" offset="100%"></stop>
                                </linearGradient>
                                <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-btagpxx67n-2">
                                    <stop stop-color="#399CFF" offset="0%"></stop>
                                    <stop stop-color="#4F90FF" offset="100%"></stop>
                                </linearGradient>
                            </defs>
                            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="Group-3" transform="translate(-0.000000, 0.000000)">
                                    <rect id="Rectangle" fill="#E69191" opacity="0.723547073" x="3" y="0" width="122" height="120" rx="8"></rect>
                                    <rect id="Rectangle" fill="url(#linearGradient-btagpxx67n-1)" x="0" y="4" width="122" height="117" rx="8"></rect>
                                    <rect id="Rectangle" fill="#FFFFFF" x="27" y="22" width="63" height="78" rx="8"></rect>
                                    <g id="Group" transform="translate(62.000000, 64.000000)">
                                        <path d="M18.4099869,1.20541652 C19.7659174,-0.401805507 22.2340537,-0.401805507 23.5899842,1.20541652 L25.223754,3.1422447 C26.0552353,4.12782435 27.3697529,4.55682714 28.6192661,4.2503016 L31.0745033,3.64790444 C33.1120482,3.14802337 35.1088591,4.6051021 35.2651755,6.70576171 L35.4534002,9.23723101 C35.5492946,10.5253815 36.3617667,11.6485243 37.5518762,12.1381094 L39.890852,13.1002505 C41.8318235,13.8985942 42.5945663,16.25626 41.4915255,18.0479906 L40.1624115,20.2070677 C39.4860587,21.3058685 39.4860587,22.6941145 40.1624115,23.7929153 L41.4915255,25.9519924 C42.5945663,27.7437229 41.8318235,30.1013887 39.890852,30.8996643 L37.5518762,31.8619247 C36.3617667,32.3514927 35.5492946,33.4746697 35.4534002,34.7626838 L35.2651755,37.2942212 C35.1088591,39.3948297 33.1120482,40.8519425 31.0745033,40.3521467 L28.6192661,39.7497325 C27.3697529,39.4430706 26.0552353,39.8721245 25.223754,40.8577383 L23.5899842,42.7945323 C22.2340537,44.4018226 19.7659174,44.4018226 18.4099869,42.7945323 L16.7762171,40.8577383 C15.9447358,39.8721245 14.6302181,39.4430706 13.380705,39.7497325 L10.9254338,40.3521467 C8.88793988,40.8519425 6.891112,39.3948297 6.73484649,37.2942212 L6.54655392,34.7626838 C6.45072737,33.4746697 5.6382553,32.3514927 4.44804399,31.8619247 L2.10910206,30.8996643 C0.168181491,30.1013887 -0.594544267,27.7437229 0.508445537,25.9519924 L1.83761046,23.7929153 C2.51398029,22.6941145 2.51398029,21.3058685 1.83761046,20.2070677 L0.508445537,18.0479906 C-0.594544267,16.25626 0.168181491,13.8985942 2.10910206,13.1002505 L4.44804399,12.1381094 C5.6382553,11.6485243 6.45072737,10.5253815 6.54655392,9.23723101 L6.73484649,6.70576171 C6.891112,4.6051021 8.88793988,3.14802337 10.9254338,3.64790444 L13.380705,4.2503016 C14.6302181,4.55682714 15.9447358,4.12782435 16.7762171,3.1422447 L18.4099869,1.20541652 Z" id="Path" fill="url(#linearGradient-btagpxx67n-2)"></path>
                                        <polygon id="Path" stroke="#FFFFFF" fill="#FFFFFF" fill-rule="nonzero" points="17.9545455 27.8208955 11.9886364 21.5522388 10 23.641791 17.9545455 32 35 14.0895522 33.0113636 12"></polygon>
                                    </g>
                                    <path d="M37,33 L64,33 C65.8778123,33.253993 66.8167185,34.253993 66.8167185,36 C66.8167185,37.746007 65.8778123,38.746007 64,39 L37,39 C35.225967,38.6548352 34.3389505,37.6548352 34.3389505,36 C34.3389505,34.3451648 35.225967,33.3451648 37,33 Z" id="Rectangle" fill="#7171AE"></path>
                                    <path d="M36.3053784,72 L56.2574884,72 C57.6451298,72.253993 58.3389505,73.253993 58.3389505,75 C58.3389505,76.746007 57.6451298,77.746007 56.2574884,78 L36.3053784,78 C34.9944265,77.6548352 34.3389505,76.6548352 34.3389505,75 C34.3389505,73.3451648 34.9944265,72.3451648 36.3053784,72 Z" id="Rectangle" fill="#7171AE"></path>
                                    <path d="M37,59 L64,59 C65.8778123,59.253993 66.8167185,60.253993 66.8167185,62 C66.8167185,63.746007 65.8778123,64.746007 64,65 L37,65 C35.225967,64.6548352 34.3389505,63.6548352 34.3389505,62 C34.3389505,60.3451648 35.225967,59.3451648 37,59 Z" id="Rectangle" fill="#B8B8E7"></path>
                                    <path d="M36.3036832,46 L78.0287825,46 C79.4355702,46.6760849 80.138964,47.6760849 80.138964,49 C80.138964,50.3239151 79.4355702,51.3239151 78.0287825,52 L36.3036832,52 C34.9938614,51.3915128 34.3389505,50.3915128 34.3389505,49 C34.3389505,47.6084872 34.9938614,46.6084872 36.3036832,46 Z" id="Rectangle" fill="#A1A1DF"></path>
                                </g>
                            </g>
                        </svg>
                    </div>
                    <div><h1 style={{ fontSize: "80px", "fontFamily": "Nunito", margin: "0px", color: "white" }}>Nifty Billy</h1></div>
                    <Button onClick={() => activateBrowserWallet()}>Connect</Button>
                </div>
            </header>
            <section style={{ padding: "20px", display: "grid", justifyContent: "center", fontFamily: "Nunito", fontWeight: "700", backgroundColor: "#151C25", color: "white" }}>

                {account && <div>
                    <section style={{ backgroundColor: "rgb(28, 38, 49)", display: "grid", gridTemplateColumns: "1fr 1fr", height: "300px" }}>
                        <div >
                            <Bar
                                datasetIdKey='id'
                                data={{
                                    labels: ['mint', 'buy', 'sell'],
                                    datasets: [
                                        {
                                            id: 1,
                                            label: "transaction",
                                            data: [items?.data?.data?.filter(d => {
                                                return d["type_x"] == "mint"
                                            }).length, items?.data?.data?.filter(d => {
                                                return d["type_x"] == "buy"
                                            }).length, items?.data?.data?.filter(d => {
                                                return d["type_x"] == "sell"
                                            }).length],
                                            backgroundColor: [  
                                                "#00b712",
                                                 '#009ffd', '#f7b42c',],
                                            borderWidth: 3,

                                        }
                                    ],
                                }}


                            />
                        </div>
                        <div>
                            <Doughnut data={{
                                labels: ['Mint', 'Buy', 'Sell'],
                                datasets: [
                                    {
                                        data: [items?.data?.data.filter(d => {
                                            return d["type_x"] == "mint"
                                        }).map((d) => calculateUSD(d) ).reduce((a, b) => a + b, 0), 
                                        items?.data?.data.filter(d => {
                                            return d["type_x"] == "buy"
                                        }).map((d) => calculateUSD(d) ).reduce((a, b) => a + b, 0),
                                        items?.data?.data.filter(d => {
                                            return d["type_x"] == "sell"
                                        }).map((d) => calculateUSD(d) ).reduce((a, b) => a + b, 0)
                                    ],
                                        backgroundColor: [
                                            '#00b712',
                                            '#009ffd',
                                            '#f7b42c'
                                        ]
                                    },
                                ],
                            }} />
                            

                        </div>

                    </section>

                    <div style={{ width: "1400px" }}>
                        {items?.data?.data?.length && <div>
                            <div style={{
                                display: "flex",
                                fontSize: "2em",
                                justifyItems: "center",
                                alignItems: "center",
                                columnGap: "10px"
                            }}><span>Invoice For, </span>  <span>{account && <Davatar
                                size={24}
                                address={account}
                                generatedAvatarType='jazzicon'
                            />}</span> <span>{account.slice(0, 5)}...{account.slice(account.length - 5, account.length)}!</span>
                            </div>
                            <p>
                                Invoice Details
                    </p>
                            <p>
                                {items?.data?.data?.filter(d => {
                                    if (event == "all") {
                                        return true
                                    } else {
                                        return d["type_x"] == event
                                    }

                                }).length} transactions:
                    </p>

                            <div style={{ display: "grid", gridGap: "15px", paddingBottom: "15px", gridTemplateColumns: "200px 100px 200px" }}>
                                <select onChange={selectChange}>
                                    <option selected disabled>
                                        Choose one
                            </option>
                                    <option value="all">Show All</option>
                                    <option value="mint">Mint Only</option>
                                    <option value="buy">Buy Only</option>
                                    <option value="sell">Sell Only</option>

                                </select>
                                <UnitButton onClick={() => { setUnits(!units) }}>{units ? "Ξ eth" : "$ usd"}</UnitButton>

                            </div>

                            <div style={{
                                paddingTop: "20px", paddingBottom: "20px", display: "grid", justifyItems: "center", alignItems: "center",
                                gridTemplateColumns: "1fr 2fr 2fr 1fr 1fr 1fr 1fr 1fr 2fr", backgroundColor: "#1C2631", width: "100%", alignItems: "center",
                                justifyItems: "center"
                            }}>
                                <span>Date</span>
                                <span>Transfer</span>
                                <span>NFTs</span>
                                <span>Quanitity</span>
                                <span>Royalty Fees</span>
                                <span>OpenSea Fees</span>
                                <span>Gas Price</span>
                                <span>Sale Price</span>
                                <span>Total Price</span>
                            </div>
                            {items?.data?.data?.filter(d => {
                                if (event == "all") {
                                    return true
                                } else {
                                    return d["type_x"] == event
                                }

                            }).map((item) => {
                                return <section style={{
                                    backgroundColor: "#151C25", padding: "10px", display: "grid", gridTemplateColumns: "1fr 2fr 2fr 1fr 1fr 1fr 1fr 1fr 2fr", borderBottom: "1px solid #1D2732", alignItems: "center",
                                    justifyItems: "center"
                                }}>
                                    <div>
                                        {item["date"]}
                                        <Tag>
                                            <span className={`tag ${item["type_x"]}`}>{item["type_x"]}</span>
                                        </Tag>
                                        {/* <Tag>
                                            <span className={`tag ${item["type_x"]}`}>{item["type_x"]}</span>
                                        </Tag> */}

                                    </div>
                                    <div>
                                        <div style={{ display: "grid", gridTemplateColumns: "45px 24px 1fr", gridGap: "5px" }}><span>From:</span>
                                            <div style={{ paddingBottom: "5px" }}><Davatar
                                                size={24}
                                                address={item["from"]}
                                                generatedAvatarType='jazzicon'
                                            />
                                            </div>
                                            <span>{item["from"].slice(0, 3)}...{item["from"].slice(item["from"].length - 3)}</span>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "20px 24px 1fr", gridGap: "5px" }}><span>To:</span>
                                            <div><Davatar
                                                size={24}
                                                address={item["to"]}
                                                generatedAvatarType='jazzicon'
                                            />
                                            </div>
                                            <span>{item["to"].slice(0, 3)}...{item["to"].slice(item["to"].length - 3)}</span>

                                        </div>
                                    </div>
                                    <div style={{ position: "relative", display: "grid", justifyContent: "center", gridTemplateColumns: "70px 200px", alignItems: "center", gridGap: "15px" }}>
                                        <img src={item["nft_image_url"]} style={{ borderRadius: "80%", height: "70px", width: "70px" }} />
                                        <span style={{ fontSize: "16px" }}>{item["nft_collection_name"]}</span>
                                    </div>


                                    <div>
                                        {item["tokenID_x"].length}
                                    </div>
                                    <div>
                                        {units ? `Ξ${item["royaltyFeeETH"].toFixed(4)}` : `$${item["royaltyFeeUSD"].toFixed(2)}`}
                                    </div>
                                    <div>
                                        {units ? `Ξ${item["openSeaFeeETH"].toFixed(4)}` : `$${item["openSeaFeeUSD"].toFixed(2)}`}
                                    </div>

                                    <div>
                                        {units ? `Ξ${item["gasPriceETH"].toFixed(4)}` : `$${(item["gasPriceETH"] * item["ETHtoUSD"]).toFixed(2)}`}

                                    </div>


                                    <div>
                                        {units ? `Ξ${item["salePriceETH"].toFixed(4)}` : `$${(item["salePriceETH"] * item["ETHtoUSD"]).toFixed(2)}`}
                                    </div>

                                    <div>

                                        {calculateTotal(item)}

                                    </div>



                                    {/* <div>
                                    <p>{item["date"]}</p>
                                    <p>#{item["tokenID_x"]}</p>
                                 
                                    <Tag>
                                    <Davatar
                                    size={24}
                                    address={item["from"]}
                                    generatedAvatarType='jazzicon'
                                />
                                        <span className={`tag ${item["type_x"]}`}>{item["type_x"]}</span>
                        

<Davatar
                                    size={24}
                                    address={item["to"]}
                                    generatedAvatarType='jazzicon'
                                />
                                    </Tag> 
                                </div>*/}




                                    {/* {JSON.stringify(item)} */}
                                </section>

                            })}
                        </div>}
                    </div>
                </div>}
            </section>






        </section >

    )
}

export default Home;