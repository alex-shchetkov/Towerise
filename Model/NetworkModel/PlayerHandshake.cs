using System;
using System.Net.WebSockets;

namespace BusinessServices.NetworkModel
{
    [Serializable]
    public class PlayerHandshake
    {
        public string Name;
        public Guid PlayerConnectionId;

        [NonSerialized]public WebSocket Socket;

    }
}