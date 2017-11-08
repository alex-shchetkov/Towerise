using System;
using System.Numerics;
using Backend;

namespace Model.BackendModel
{
    [Serializable]
    public class Rock: WorldEntity,IDestructible
    {
        
        public int MaxHp { get; set; }
        public int CurrentHp { get; set; }

        public void DealDamage(Entity damageSource, int amount)
        {
            CurrentHp -= amount;
            if(CurrentHp<=0) OnDestroyed?.Invoke(this, EventArgs.Empty);
        }

        public event EventHandler<EventArgs> OnDestroyed;

        public Rock(GridCell cell, Vector2 initialLocalCoord) : base(cell, initialLocalCoord)
        {
            
        }
    }
}