using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpertiseFrance.Core.Interfaces.Services;

namespace ExpertiseFrance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MIPDataController : ControllerBase
    {
        private readonly IMIPDataService _mipDataService;

        public MIPDataController(IMIPDataService mipDataService)
        {
            _mipDataService = mipDataService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMIPData()
        {
            try
            {
                var mipData = await _mipDataService.GetAllMIPDataAsync();
                return Ok(mipData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetMIPDataById(int id)
        {
            try
            {
                var mipData = await _mipDataService.GetMIPDataByIdAsync(id);
                if (mipData == null)
                    return NotFound($"MIP Data with ID {id} not found");

                return Ok(mipData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{guid:guid}")]
        public async Task<IActionResult> GetMIPDataByGuid(Guid guid)
        {
            try
            {
                var mipData = await _mipDataService.GetMIPDataByGuidAsync(guid);
                if (mipData == null)
                    return NotFound($"MIP Data with GUID {guid} not found");

                return Ok(mipData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("country/{country}")]
        public async Task<IActionResult> GetMIPDataByCountry(string country)
        {
            try
            {
                var mipData = await _mipDataService.GetMIPDataByCountryAsync(country);
                return Ok(mipData);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
