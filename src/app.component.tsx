import { useCallback, useContext, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import styles from "./app.module.css";
import { ethos, EthosConnectProvider, EthosConnectStatus, ProviderAndSigner,  } from 'ethos-connect'

const App = () => {
  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    sendMessage,
    addEventListener,
    removeEventListener,
    requestFullscreen,
    takeScreenshot,
    unload,
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


  const [isPlaying, setIsPlaying] = useState(false);
  const [screenshotDatas, setScreenshotDatas] = useState<string[]>([]);
  const [scores, setScores] = useState<[number, number][]>([]);

  const handleClickStartGame = (time: number) => {
    if (isLoaded === false || isPlaying === true) {
      return;
    }
    setIsPlaying(true);
    sendMessage("GameController", "StartGame", time);
  };

  const handleClickFullscreen = () => {
    if (isLoaded === false) {
      return;
    }
    requestFullscreen(true);
  };

  const handleClickScreenshot = () => {
    if (isLoaded === false) {
      return;
    }
    const screenshotData = takeScreenshot();
    if (screenshotData !== undefined) {
      setScreenshotDatas([screenshotData, ...screenshotDatas]);
    }
  };

  const handleClickUnload = async () => {
    if (isLoaded === false) {
      return;
    }
    try {
      await unload();
      console.log("Unload success");
    } catch (error) {
      console.error(`Unable to unload: ${error}`);
    }
  };

  const handleGameOver = useCallback(
    (time: number, score: number) => {
      time = Math.round(time);
      setIsPlaying(false);
      setScores([[time, score], ...scores]);
    },
    [scores]
  );

  const handleConnectWallet = useCallback(
    () => {
      ethos.showSignInModal();
    },
    []
  );

  const handleSendWalletAddress = useCallback(
    () => {
      const address = walletContextContent.wallet?.address;
      console.log("handleSendWalletAddress: " + address);

      if (address !== undefined) {
        sendMessage("WalletConnector", "InvokeOnConnectedWalletAddressReturned", address);
      }
    },
    [walletContextContent]
  );

  const handleDisconnectWallet = useCallback(
    () => {
      console.log("handleDisconnectWallet: " + walletContextContent.status);
      walletContextContent.wallet?.disconnect();
    },
    [walletContextContent]
  );

  const handleGetConnectedWalletAddress = useCallback(
    () => {
      const address = walletContextContent.wallet?.address;
      console.log("handleGetConnectedWalletAddress: " + address);

      if (address !== undefined) {
        sendMessage("WalletConnector", "InvokeOnConnectedWalletAddressReturned", address);
      }
    },
    [walletContextContent, sendMessage]
  );

  useEffect(
    () => { 
      let address = walletContextContent.wallet?.address;
      console.log("handleUnityLoaded: " + isLoaded + ", walletContextContent.status : " + walletContextContent.status + ", address: " + address);
      if (isLoaded === false) {
        return;
      }
      if (address !== undefined) {
        console.log("calling InvokeOnWalletConnected.");
        sendMessage("WalletConnector", "InvokeOnWalletConnected", walletContextContent.wallet?.address);
      }
    }, [isLoaded, sendMessage, walletContextContent ]
  )

  useEffect(() => {
    addEventListener("GameOver", handleGameOver);
    return () => {
      removeEventListener("GameOver", handleGameOver);
    };
  }, [handleGameOver, addEventListener, removeEventListener]);

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
    addEventListener("GetConnectedWalletAddress", handleGetConnectedWalletAddress);
    return () => {
      removeEventListener("GetConnectedWalletAddress", handleGetConnectedWalletAddress);
    };
  }, [walletContextContent, handleGetConnectedWalletAddress, addEventListener, removeEventListener]);


  return (
    <EthosConnectProvider
      ethosConfiguration={{
        hideEmailSignIn: true             
      }} onWalletConnected={async ({provider, signer }: ProviderAndSigner) => {
        let address = await signer?.getAddress();
        console.log("onwalletconnected: " + address);        

        if (isLoaded) {
          if (address !== undefined)
          {
            sendMessage("WalletConnector", "InvokeOnWalletConnected", address);

          }
          else
          {
            sendMessage("WalletConnector", "InvokeOnWalletDisconnected");
          }
        }
      }}
    >
      <div className={styles.container}>
        <h1>Crate Clicker!</h1>
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
        <div className="buttons">
          <button onClick={() => handleClickStartGame(5)}>
            Start Short Game
          </button>
          <button onClick={() => handleClickStartGame(10)}>
            Start Long Game
          </button>
          <button onClick={handleClickFullscreen}>Fullscreen</button>
          <button onClick={handleClickScreenshot}>Screenshot</button>
          <button onClick={handleClickUnload}>Unload</button>
          <button onClick={handleSendWalletAddress}>SendWalletAddress</button>
          {/* <button onClick={ethos.showSignInModal}>Show sign in</button> */}
          <ethos.components.AddressWidget />
        </div>
        <h2>Scores</h2>
        <ul>
          {scores.map(([time, score]) => (
            <li key={time}>
              {score} points with {time} seconds left!
            </li>
          ))}
        </ul>
        <h2>Screenshots</h2>
        <div className={styles.screenshots}>
          {screenshotDatas.map((data, index) => (
            <img width={250} key={index} src={data} alt="Screenshot" />
          ))}
        </div>
      </div>
    </EthosConnectProvider>
  );
};

export { App };
