using System;
using System.Net.WebSockets;
using System.Numerics;
using BusinessServices.NetworkModel;

namespace Model.BackendModel
{
    [Serializable]
    public class Player: WorldEntity
    {
        [NonSerialized]public WebSocket Socket;
        
        public event EventHandler PlayerDisconnected;


        public Player(PlayerHandshake info, GridCell cell, Vector2 initialLocalCoords) : base(cell, initialLocalCoords)
        {
            UniqueId = info.PlayerConnectionId;
            Name = info.Name;
            Socket = info.Socket;
        }

        public int Exp { get; set; }
        public int Level { get; set; }

        
        public PlayerInventory Inventory { get; set; }


        public Guid UniqueId;

        public virtual void OnPlayerDisconnected()
        {
            PlayerDisconnected?.Invoke(this, EventArgs.Empty);
        }
    }
}
