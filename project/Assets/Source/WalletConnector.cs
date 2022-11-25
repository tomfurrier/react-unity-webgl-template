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
 	static extern void GetConnectedWalletAddress();

    public void ConnectWallet_Istance()
    {
        ConnectWallet();
    }
    
    public void DisconnectWallet_Istance()
    {
        DisconnectWallet();
    }

	public void GetConnectedWalletAddress_Istance()
    {
		GetConnectedWalletAddress();
    }
    
    // WebGL -> Unity
    
    // Will be called after Unity is loaded if wallet is connected already.
    public delegate void WalletConnectedAction(string address);
    public static event WalletConnectedAction OnWalletConnected;
    
    public delegate void WalletDisconnectedAction();
    public static event WalletDisconnectedAction OnWalletDisconnected;
    
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

 	public void InvokeOnConnectedWalletAddressReturned(string address)
    {
        Debug.Log("InvokeOnConnectedWalletAddressReturned. " + address);
    }
}
