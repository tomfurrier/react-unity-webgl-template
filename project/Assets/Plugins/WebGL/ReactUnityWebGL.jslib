mergeInto(LibraryManager.library, {
  GameOver: function (time, score) {
    dispatchReactUnityEvent("GameOver", time, score);
  },
  ConnectWallet: function () {
    dispatchReactUnityEvent("ConnectWallet");
  },
  DisconnectWallet: function () {
    dispatchReactUnityEvent("DisconnectWallet");
  },
});
