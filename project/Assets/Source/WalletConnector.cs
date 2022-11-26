using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;

public class WalletConnector : MonoBehaviour
{
    // Unity -> WebGL
    [DllImport ("__Internal")]
    static extern void ConnectWallet();
    
    [DllImport ("__Internal")]
    static extern void DisconnectWallet();

	[DllImport ("__Internal")]
 	static extern void RequestConnectedWalletAddress();

    public void ConnectWallet_Istance()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        ConnectWallet();
#endif
    }
    
    public void DisconnectWallet_Istance()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        DisconnectWallet();
#endif
    }

	public void GetConnectedWalletAddress_Istance()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
		RequestConnectedWalletAddress();
#endif
    }

    // WebGL -> Unity

    // Will be called after Unity is loaded if wallet is connected already.
    public delegate void WalletConnectedAction(string address);
    public static event WalletConnectedAction OnWalletConnected;
    
    public delegate void WalletDisconnectedAction();
    public static event WalletDisconnectedAction OnWalletDisconnected;

    public delegate void ReturnConnectedWalletAddressAction(string addres);
    public static event ReturnConnectedWalletAddressAction OnConnectedWalletAddressReturned;


    public void InvokeOnWalletConnected(string address)
    {
        Debug.Log("Wallet connected: " + address);
        if (OnWalletConnected != null)
        {
            OnWalletConnected(address);
        }
    }
    
    public void InvokeOnWalletDisconnected()
    {
        Debug.Log("Wallet disconnected.");
        if (OnWalletDisconnected != null)
        {
            OnWalletDisconnected();
        }
    }

 	public void InvokeReturnConnectedWalletAddress(string address)
    {
        Debug.Log("InvokeReturnConnectedWalletAddress. " + address);
        if (OnConnectedWalletAddressReturned != null)
        {
            OnConnectedWalletAddressReturned(address);
        }
    }
}
