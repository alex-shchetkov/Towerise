using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;

namespace Backend
{
    public class Player
    {
        public WebSocket Socket;
        public float x, y;

        public Player(WebSocket socket)
        {
            Socket = socket;
            x = 0;
            y = 0;
        }
    }
}
