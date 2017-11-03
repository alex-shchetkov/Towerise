using System;

namespace Backend
{
    [Serializable]
    public class Rock: WorldEntity,IDestructible
    {
        public override void OnDestroy()
        {
            base.OnDestroy();
            SpawnLittleRocks();
        }

        private void SpawnLittleRocks()
        {
            WorldState.Instance.AddItem(new ThrowableRock(X, Y));
        }
        
        public int MaxHp { get; set; }
        public int CurrentHp { get; set; }
    }
}