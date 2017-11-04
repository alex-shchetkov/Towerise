using System;
using System.Numerics;
using Model.BackendModel;

namespace Model.NetworkModel
{
    [Serializable]
    public class PlayerAction
    {
        public PlayerActionType Type;
        public Vector2 Velocity;

        [NonSerialized]public Player Player;
    }

    public enum PlayerActionType
    {
        Move,
        Punch,
        Throw
    }
}