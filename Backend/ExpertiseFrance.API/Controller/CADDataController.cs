using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpertiseFrance.Core.Interfaces.Services;

namespace ExpertiseFrance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CADDataController : ControllerBase
    {
        private readonly ICADDataService _cadDataService;

        public CADDataController(ICADDataService cadDataService)
        {
            _cadDataService = cadDataService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCADData()
        {
            try
            {
                var cadData = await _cadDataService.GetAllCADDataAsync();
                return Ok(cadData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCADDataById(int id)
        {
            try
            {
                var cadData = await _cadDataService.GetCADDataByIdAsync(id);
                if (cadData == null)
                    return NotFound($"CAD Data with ID {id} not found");

                return Ok(cadData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{guid:guid}")]
        public async Task<IActionResult> GetCADDataByGuid(Guid guid)
        {
            try
            {
                var cadData = await _cadDataService.GetCADDataByGuidAsync(guid);
                if (cadData == null)
                    return NotFound($"CAD Data with GUID {guid} not found");

                return Ok(cadData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetCADDataByCategory(string category)
        {
            try
            {
                var cadData = await _cadDataService.GetCADDataByCategoryAsync(category);
                return Ok(cadData);
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

        [HttpGet("department/{department:int}")]
        public async Task<IActionResult> GetCADDataByDepartment(int department)
        {
            try
            {
                var cadData = await _cadDataService.GetCADDataByDepartmentAsync(department);
                return Ok(cadData);
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
