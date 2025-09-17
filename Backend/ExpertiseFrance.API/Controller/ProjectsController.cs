using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpertiseFrance.Core.Interfaces.Services;

namespace ExpertiseFrance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProjects()
        {
            try
            {
                var projects = await _projectService.GetAllProjectsAsync();
                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("cad-categories")]
        public async Task<IActionResult> GetAllCadCategory()
        {
            try
            {
                var projects = await _projectService.GetAllCadCategory();
                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetProjectById(int id)
        {
            try
            {
                var project = await _projectService.GetProjectByIdAsync(id);
                if (project == null)
                    return NotFound($"Project with ID {id} not found");

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{guid:guid}")]
        public async Task<IActionResult> GetProjectByGuid(Guid guid)
        {
            try
            {
                var project = await _projectService.GetProjectByGuidAsync(guid);
                if (project == null)
                    return NotFound($"Project with GUID {guid} not found");

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("country/{country}")]
        public async Task<IActionResult> GetProjectsByCountry(string country)
        {
            try
            {
                var projects = await _projectService.GetProjectsByCountryAsync(country);
                return Ok(projects);
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

        [HttpGet("year/{year:int}")]
        public async Task<IActionResult> GetProjectsByYear(int year)
        {
            try
            {
                var projects = await _projectService.GetProjectsByYearAsync(year);
                return Ok(projects);
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
        [HttpGet("section2charts")]
        public async Task<IActionResult> GetSection2ChartsData()
        {
            try
            {
                var chartData = await _projectService.GetSection2ChartsDataAsync();
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpGet("section3charts")]
        public async Task<IActionResult> GetSection3ChartsDataAsync(string yearRange = null, string category = null)
        {
        try
            {
                var chartData = await _projectService.GetSection3ChartsDataAsync(yearRange,category);
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
       }

        [HttpGet("global-top-cad")]
        public async Task<IActionResult> GetGlobalTopCAD()
        {
            try
            {
                var topCADData = await _projectService.GetGlobalTopCADAsync();
                return Ok(topCADData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("global-top-departments")]
        public async Task<IActionResult> GetGlobalTopDepartments()
        {
            try
            {
                var topDepartmentData = await _projectService.GetGlobalTopDepartmentsAsync();
                return Ok(topDepartmentData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
