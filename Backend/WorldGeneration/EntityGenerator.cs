using System.Numerics;
using Model.BackendModel;

namespace Backend.WorldGeneration
{
    public class EntityGenerator
    {
        public WorldState World;

        private int _entityCount;

        public EntityGenerator(WorldState world)
        {
            World = world;
            _entityCount = 0;
        }


        public virtual void CreateDestructibleEntity(IDestructible newEntity)
        {
            _entityCount++;
            newEntity.OnDestroyed += NewEntity_OnDestroyed;
        }

        private void NewEntity_OnDestroyed(object sender, System.EventArgs e)
        {
            _entityCount--;
        }
    }
}