namespace Backend
{
    public interface IDestructible
    {
        int MaxHp { get; set; }
        int CurrentHp { get; set; }
    }
}