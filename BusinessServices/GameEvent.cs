using Model.BackendModel;

namespace BusinessServices
{
    public class GameEvent
    {
        public Manager TargetManager;
        public WorldEntity Source;
        public EventAction Action;

        public GameEvent(Manager targetManager, WorldEntity source, EventAction action)
        {
            
        }
    }

    public enum EventAction
    {
        Move,

    }
}