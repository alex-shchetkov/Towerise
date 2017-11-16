using System;
using System.Numerics;
using Model.BackendModel;

namespace Model.NetworkModel
{
    [Serializable]
    public class UserCommand
    {
        public CommandType Type;
        public int Tick;
        
        public Vector2 Direction; 
        

        [NonSerialized]public Player Player;

    }

    public enum CommandType
    {
        MouseDown=1,
        MouseUp=2,
        Direction=0
    }
}