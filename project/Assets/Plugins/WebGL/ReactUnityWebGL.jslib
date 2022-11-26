mergeInto(LibraryManager.library, {
  ConnectWallet: function () {
    dispatchReactUnityEvent("ConnectWallet");
  },
  DisconnectWallet: function () {
    dispatchReactUnityEvent("DisconnectWallet");
  },
  RequestWalletAddress: function () {
    dispatchReactUnityEvent("RequestWalletAddress");
  }
});
