import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import styles from "./app.module.css";
import { ethos, EthosConnectProvider, ProviderAndSigner,  } from 'ethos-connect'

const App = () => {
  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnityContext({
    loaderUrl: "/unitybuild/unitybuild.loader.js",
    dataUrl: "/unitybuild/unitybuild.data",
    frameworkUrl: "/unitybuild/unitybuild.framework.js",
    codeUrl: "/unitybuild/unitybuild.wasm",
    webglContextAttributes: {
      preserveDrawingBuffer: true,
    },
  });

  const walletContextContent = ethos.useWallet();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();

  const handleConnectWallet = useCallback(
    () => {
      ethos.showSignInModal();
    },
    []
  );

  const handleDisconnectWallet = useCallback(
    () => {
      walletContextContent.wallet?.disconnect();
    },
    [walletContextContent]
  );

  const handleRequestWalletAddress = useCallback(
    () => {
        let address = walletAddress ?? "";
        sendMessage("WalletConnector", "ReturnWalletAddress", address);
    },
    [walletAddress, sendMessage]
  );

  useEffect(
    () => { 
      if (isLoaded === false || walletAddress === undefined) {
        return;
      }
      sendMessage("WalletConnector", "InvokeOnWalletConnected", walletAddress);
    }, [isLoaded, sendMessage, walletAddress ]
  )

  useEffect(() => {
    addEventListener("ConnectWallet", handleConnectWallet);
    return () => {
      removeEventListener("ConnectWallet", handleConnectWallet);
    };
  }, [handleConnectWallet, addEventListener, removeEventListener]);

  useEffect(() => {
    addEventListener("DisconnectWallet", handleDisconnectWallet);
    return () => {
      removeEventListener("DisconnectWallet", handleDisconnectWallet);
    };
  }, [handleDisconnectWallet, addEventListener, removeEventListener]);

  useEffect(() => {
    addEventListener("RequestWalletAddress", handleRequestWalletAddress);
    return () => {
      removeEventListener("RequestWalletAddress", handleRequestWalletAddress);
    };
  }, [handleRequestWalletAddress, addEventListener, removeEventListener]);

  return (
    <EthosConnectProvider
      ethosConfiguration={{
        hideEmailSignIn: true             
      }} onWalletConnected={async ({provider, signer }: ProviderAndSigner) => {
        
        let address = await signer?.getAddress();
        setWalletAddress(address);

        if (address === undefined)
        {
          sendMessage("WalletConnector", "InvokeOnWalletDisconnected");
        }
      }}
    >
      <div className={styles.container}>
        <div className={styles.unityWrapper}>
          {isLoaded === false && (
            <div className={styles.loadingBar}>
              <div
                className={styles.loadingBarFill}
                style={{ width: loadingProgression * 100 }}
              />
            </div>
          )}
          <Unity
            unityProvider={unityProvider}
            style={{ display: isLoaded ? "block" : "none" }}
          />
        </div>
        <div className="topright">
          <ethos.components.AddressWidget />
        </div>
      </div>
    </EthosConnectProvider>
  );
};

export { App };
