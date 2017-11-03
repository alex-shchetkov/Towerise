using System;
using System.Net.WebSockets;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;

namespace Backend
{
    [Serializable]
    public class WorldEntity
    {


        //serializable
        public virtual float X { get; set; }
        public virtual float Y { get; set; }

        public virtual void Destroy()
        {
            OnDestroy();
        }

        public virtual void OnDestroy()
        {
            
        }

        //non-serializable
    }
}