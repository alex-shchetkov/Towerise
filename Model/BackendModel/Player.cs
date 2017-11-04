using System;
using System.Net.WebSockets;
using System.Numerics;
using BusinessServices.NetworkModel;

namespace Model.BackendModel
{
    [Serializable]
    public class Player: WorldEntity
    {
        public WebSocket Socket;

        public Player(PlayerHandshake info, GridCell cell, Vector2 initialCoords) : base(cell, initialCoords)
        {
            UniqueId = info.PlayerConnectionId;
            Name = info.Name;
            Socket = info.Socket;
        }

        public int Exp { get; set; }
        public int Level { get; set; }

        
        public PlayerInventory Inventory { get; set; }


        public Guid UniqueId;
        
    }
}
