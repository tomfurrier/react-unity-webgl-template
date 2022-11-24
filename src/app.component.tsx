import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import styles from "./app.module.css";
import { ethos, EthosConnectProvider, EthosConnectStatus, ProviderAndSigner  } from 'ethos-connect'
import { Stats } from "fs";

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

  const handleDisconnectWallet = useCallback(
    () => {
      const { status, wallet } = ethos.useWallet();
      if (status === EthosConnectStatus.Connected) {
        wallet?.disconnect();
        sendMessage("WalletConnector", "InvokeOnWalletDisconnected");
      }
    },
    []
  );

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

  return (
    <EthosConnectProvider
      ethosConfiguration={{
        hideEmailSignIn: true             
      }} onWalletConnected={async ({provider, signer }: ProviderAndSigner) => {
        let address = await signer?.getAddress();
        console.log("onwalletconnected. " + address);
        sendMessage("WalletConnector", "InvokeOnWalletConnected", address);
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
