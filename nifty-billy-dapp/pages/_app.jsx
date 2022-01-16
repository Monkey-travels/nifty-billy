//import '../styles/globals.css'
import { Mainnet, DAppProvider } from '@usedapp/core'
const LOCAL_CHAIN_ID = 4;

const useDappConfig = {
    readOnlyChainId: Mainnet.chainId,
    readOnlyUrls: {
        [Mainnet.chainId]: "https://mainnet.infura.io/v3/e2af17a48af94af3a396c3087018ad21",
    },
};

function App({ Component, pageProps }) {
    return <DAppProvider config={useDappConfig}>
            <Component {...pageProps} />
        </DAppProvider>

}

export default App;