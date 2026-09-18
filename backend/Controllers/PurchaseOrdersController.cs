using System.ComponentModel.DataAnnotations;
using EnhanzerProject.Models.DTOs.PurchaseOrders;
using EnhanzerProject.Security;
using EnhanzerProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnhanzerProject.Controllers;

[ApiController]
[Authorize]
[Route("api/purchase-orders")]
public sealed class PurchaseOrdersController(IPurchaseOrderService purchaseOrderService) : ControllerBase
{
    /// <summary>Returns the item names offered by the Item autocomplete.</summary>
    [HttpGet("item-options")]
    [ProducesResponseType<IReadOnlyCollection<string>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyCollection<string>> GetItemOptions() => Ok(purchaseOrderService.GetItemOptions());

    /// <summary>Returns the signed-in company's most recent orders, without their lines.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyCollection<PurchaseOrderSummaryResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<PurchaseOrderSummaryResponse>>> GetOrders(
        [FromQuery] [Range(1, 100)] int take = 20,
        CancellationToken cancellationToken = default)
    {
        return Ok(await purchaseOrderService.GetOrdersAsync(User.GetCompanyCode(), take, cancellationToken));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<PurchaseOrderResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PurchaseOrderResponse>> GetOrder(int id, CancellationToken cancellationToken)
    {
        var order = await purchaseOrderService.GetOrderAsync(User.GetCompanyCode(), id, cancellationToken);
        return order is null ? NotFound() : Ok(order);
    }

    /// <summary>Saves a purchase order with all of its lines.</summary>
    [HttpPost]
    [ProducesResponseType<PurchaseOrderResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PurchaseOrderResponse>> CreateOrder(
        CreatePurchaseOrderRequest request,
        CancellationToken cancellationToken)
    {
        var result = await purchaseOrderService.CreateOrderAsync(User.GetCompanyCode(), request, cancellationToken);
        if (result.Order is null)
        {
            ModelState.AddModelError(
                result.ErrorField ?? string.Empty,
                result.ErrorMessage ?? "The purchase order is invalid.");
            return ValidationProblem(ModelState);
        }

        return CreatedAtAction(nameof(GetOrder), new { id = result.Order.Id }, result.Order);
    }
}
