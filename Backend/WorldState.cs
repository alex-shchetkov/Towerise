using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Backend
{
    [Serializable]
    public class WorldState
    {
        public static WorldState Instance;

        public List<Player> PlayerList;

        public List<WorldEntity> WorldEntities;

        public List<Item> Items { get; set; }

        public WorldState()
        {
            Instance = this;
            PlayerList = new List<Player>();
            Items = new List<Item>();
            WorldEntities = new List<WorldEntity>();


        }


        public Player AddPlayer()
        {
            var newId = Guid.NewGuid();
            var newPlayer = new Player(newId);
            PlayerList.Add(newPlayer);


            return newPlayer;
            // Thread t = new Thread(new ParameterizedThreadStart(async (p) => { await Echo((Player)p); }));
            //t.Start(newPlayer);

        }


        

        public void AddItem(Item newItem)
        {
            Items.Add(newItem);
        }
    }

}
