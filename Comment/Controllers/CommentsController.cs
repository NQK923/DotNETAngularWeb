using Comment.Data;
using Comment.Hubs;
using Comment.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace Comment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly IHubContext<CommentHub> _hubContext;

        private readonly CommentDbContext _dbContext;

        //public CommentsController(IHubContext<CommentHub> hubContext)
        //{
        //    _hubContext = hubContext;
        //}



        public CommentsController(CommentDbContext dbContext, IHubContext<CommentHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        // GET: api/comment
        [HttpGet]
        public async Task<IActionResult> GetAllComments()
        {
            var comments = await _dbContext.Comment.ToListAsync();
            return Ok(comments);
        }

        // GET: api/comment/{idChapter}
        [HttpGet("{idChapter}")]
        public async Task<IActionResult> GetCommentsByChapter(int idChapter)
        {
            var comments = await _dbContext.Comment
                .Where(c => c.IdChapter == idChapter)
                .ToListAsync();

            if (comments.Count == 0)
            {
                return NotFound();
            }

            return Ok(comments);
        }

        // POST: api/comment
        [HttpPost]
        public async Task<IActionResult> AddComment([FromBody] CommentDTO comment)
        {
            try
            {
                if (comment == null)
                {
                    return BadRequest("Comment data is null.");
                }
                var c = new CommentDTO
                {
                    IdChapter = comment.IdChapter,
                    IdAccount = comment.IdAccount,
                    Content = comment.Content,
                    IsReported = comment.IsReported,
                    Time = comment.Time,
                };

                _dbContext.Comment.Add(c);
                await _dbContext.SaveChangesAsync();
                // Phát tín hiệu tới các client
                await _hubContext.Clients.All.SendAsync("ReceiveComment", comment);

                return Ok(true);
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.InnerException?.Message ?? ex.Message);
            }
        }

        // PUT: api/comment
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateComment([FromBody] CommentDTO comment, int id)
        {
            try
            {
                var c = await _dbContext.Comment.FindAsync(id);
                if (comment.IdComment != c.IdComment)
                {
                    return BadRequest("Comment data is fail.");
                }

                c.Content = comment.Content;
                c.IsReported = comment.IsReported;
                c.Time = comment.Time;

                _dbContext.Comment.Update(c);
                await _dbContext.SaveChangesAsync();

                // Phát tín hiệu tới các client
                await _hubContext.Clients.All.SendAsync("ReceiveUpdatedComment", comment);

                return Ok(true);
            }
            catch (Exception ex)
            {
                return Problem("An error occurred during the update: " + ex.Message);
            }
        }

        // DELETE: api/comment/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _dbContext.Comment.FindAsync(id);
            if (comment == null)
            {
                return NotFound();
            }

            _dbContext.Comment.Remove(comment);
            await _dbContext.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveDeletedComment", id);
            return Ok(true);
        }

        //[HttpPost]
        //public async Task<IActionResult> PostComment([FromBody] string comment)
        //{
        //    // Lưu comment vào database tại đây nếu cần thiết

        //    // Phát comment tới các client
        //    await _hubContext.Clients.All.SendAsync("ReceiveComment", comment);
        //    return Ok(new { message = "Comment sent" });
        //}
    }
}
