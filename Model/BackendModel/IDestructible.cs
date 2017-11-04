using System;
using Model.BackendModel;

namespace Backend
{
    public interface IDestructible
    {
        int MaxHp { get; set; }
        int CurrentHp { get; set; }
        void DealDamage(Entity damageSource, int amount);
        event EventHandler<EventArgs> OnDestroyed;
    }
}