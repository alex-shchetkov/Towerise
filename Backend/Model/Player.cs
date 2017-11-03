using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;

namespace Backend
{
    [Serializable]
    public class Player: WorldEntity
    {

        public Player(Guid playerId)
        {
            UniqueId = playerId;
        }

        public int Exp { get; set; }
        public int Level { get; set; }

        
        public PlayerInventory Inventory { get; set; }


        public Guid UniqueId;
    }
}
