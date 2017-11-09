using System;
using System.Net.WebSockets;
using System.Numerics;
using BusinessServices.NetworkModel;

namespace Model.BackendModel
{
    [Serializable]
    public class Player: WorldEntity
    {
        [NonSerialized]
        public WebSocket Socket;
        
        public event EventHandler PlayerDisconnected;


        public Player(PlayerHandshake info, GridCell cell, Vector2 initialLocalCoords, string color) 
            : base(cell, initialLocalCoords)
        {
            UniqueId = info.PlayerConnectionId;
            Name = info.Name;
            Socket = info.Socket;
            Color = color;
        }

        public int Exp { get; set; }
        public int Level { get; set; }

        public string Color { get; set; }

        public PlayerInventory Inventory { get; set; }

        public Guid UniqueId;

        public virtual void OnPlayerDisconnected()
        {
            PlayerDisconnected?.Invoke(this, EventArgs.Empty);
        }
    }
}
