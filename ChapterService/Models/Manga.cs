using System.ComponentModel.DataAnnotations;

public class Manga
{
    [Key] public int id_manga { get; set; }

    public string name { get; set; }
    public string author { get; set; }
    public int num_of_chapter { get; set; }
    public double rating { get; set; }
    public int id_account { get; set; }
    public bool is_posted { get; set; }
    public string cover_img { get; set; }
    public string describe { get; set; }
    public DateTime updated_at { get; set; }
}