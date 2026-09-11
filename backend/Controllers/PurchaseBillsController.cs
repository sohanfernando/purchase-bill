using EnhanzerProject.Models.DTOs.PurchaseBills;
using EnhanzerProject.Security;
using EnhanzerProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnhanzerProject.Controllers;

[ApiController]
[Authorize]
[Route("api/purchase-bills")]
public sealed class PurchaseBillsController(IPurchaseBillService purchaseBillService) : ControllerBase
{
    /// <summary>Returns the item names offered by the Item autocomplete.</summary>
    [HttpGet("item-options")]
    [ProducesResponseType<IReadOnlyCollection<string>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyCollection<string>> GetItemOptions() => Ok(purchaseBillService.GetItemOptions());

    [HttpGet("items")]
    [ProducesResponseType<IReadOnlyCollection<PurchaseBillItemResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<PurchaseBillItemResponse>>> GetItems(CancellationToken cancellationToken)
    {
        return Ok(await purchaseBillService.GetItemsAsync(User.GetCompanyCode(), cancellationToken));
    }

    [HttpGet("items/{id:int}")]
    [ProducesResponseType<PurchaseBillItemResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PurchaseBillItemResponse>> GetItem(int id, CancellationToken cancellationToken)
    {
        var item = await purchaseBillService.GetItemAsync(User.GetCompanyCode(), id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("items")]
    [ProducesResponseType<PurchaseBillItemResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PurchaseBillItemResponse>> AddItem(
        CreatePurchaseBillItemRequest request,
        CancellationToken cancellationToken)
    {
        var result = await purchaseBillService.AddItemAsync(User.GetCompanyCode(), request, cancellationToken);
        if (result.Item is null)
        {
            ModelState.AddModelError(
                result.ErrorField ?? string.Empty,
                result.ErrorMessage ?? "The purchase bill item is invalid.");
            return ValidationProblem(ModelState);
        }

        return CreatedAtAction(nameof(GetItem), new { id = result.Item.Id }, result.Item);
    }
}
