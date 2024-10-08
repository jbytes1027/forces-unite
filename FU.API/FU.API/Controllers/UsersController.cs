namespace FU.API.Controllers;

using FU.API.DTOs.Post;
using FU.API.DTOs.Search;
using FU.API.Exceptions;
using FU.API.Helpers;
using FU.API.Interfaces;
using FU.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Handles user related requests.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ISearchService _searchService;
    private readonly IStorageService _storageService;

    public UsersController(IUserService userService, ISearchService searchService, IStorageService storageService)
    {
        _userService = userService;
        _searchService = searchService;
        _storageService = storageService;
    }

    [HttpGet]
    [Route("{userIdString}")]
    public async Task<IActionResult> GetUserProfile(string userIdString)
    {
        // if the route is current, get userId from auth token, otherwise use the given id
        int userId;
        if (userIdString == "current")
        {
            bool isParseSuccess = int.TryParse((string?)HttpContext.Items[CustomContextItems.UserId], out userId);
            if (!isParseSuccess)
            {
                return Unauthorized();
            }
        }
        else
        {
            bool isParseSuccess = int.TryParse(userIdString, out userId);
            if (!isParseSuccess)
            {
                return NotFound();
            }
        }

        var profile = await _userService.GetUserProfile(userId);

        if (profile is null)
        {
            return NotFound();
        }

        return Ok(profile);
    }

    [Authorize]
    [HttpPatch]
    [Route("current")] // Will never change anyone else's profile
    public async Task<IActionResult> UpdateProfile([FromBody] UserProfile profileChanges)
    {
        // Check if the user to update is the authenticated user
        bool isParseSuccess = int.TryParse((string?)HttpContext.Items[CustomContextItems.UserId], out int userId);
        if (!isParseSuccess)
        {
            return Unauthorized();
        }

        // Allows updateUserProfile to find the user to update
        // Overrides any client given id that may differ from userId.
        profileChanges.Id = userId;

        // Make sure its an image already in our blob storage
        // Otherwise we are unure if the image is cropped, resized, and in the right format
        if (profileChanges?.PfpUrl is not null)
        {
            Uri avatarUri;

            try
            {
                avatarUri = new(profileChanges.PfpUrl);
            }
            catch (UriFormatException)
            {
                throw new UnprocessableException("Invalid avatar url format.");
            }

            if (!(await _storageService.IsInStorageAsync(avatarUri)))
            {
                throw new UnprocessableException("Invalid profile picture. The image must be uploaded to our storage system");
            }
        }

        var newProfile = await _userService.UpdateUserProfile(profileChanges!);

        return Ok(newProfile);
    }

    [HttpGet]
    [Route("current/connected/posts")]
    public async Task<IActionResult> GetUsersAssociatedPosts([FromQuery] PostSearchRequestDTO request)
    {
        var user = await _userService.GetAuthorizedUser(User) ?? throw new UnauthorizedException();

        var query = request.ToPostQuery();
        query.UserId = user.UserId;

        (var posts, var totalResults) = await _searchService.SearchPosts(query);

        var postDtos = new List<PostResponseDTO>(posts.Count);

        // for each resonse set has joined to true
        foreach (var post in posts)
        {
            postDtos.Add(post.ToDto(hasJoined: true));
        }

        Response.Headers.Append("X-total-count", totalResults.ToString());

        return Ok(postDtos);
    }

    [HttpGet]
    [Route("current/connected/groups")]
    public async Task<IActionResult> GetUsersGroups([FromQuery] int limit = 10, [FromQuery] int offset = 0)
    {
        var user = await _userService.GetAuthorizedUser(User) ?? throw new UnauthorizedException();

        var groups = await _userService.GetUsersGroups(user.UserId, limit, offset);

        var response = groups.ToSimpleDtos();

        return Ok(response);
    }
}
