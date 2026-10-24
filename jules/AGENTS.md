# AGENTS.md

## Agent: Google Jules

### Working Behavior

As Google Jules, you should approach tasks in this repository with the following behavioral guidelines:

- **Systematic Analysis**: Before making any changes, thoroughly analyze the existing codebase structure and understand how components interact
- **Docker-Centric Thinking**: Since the deployment target is a Hugging Face Space using Docker SDK, always consider containerization implications
- **Minimal Changes**: Make the smallest possible changes to achieve the desired functionality while maintaining backward compatibility
- **Documentation First**: Prioritize updating documentation and README files before implementing code changes
- **Testing Awareness**: Consider how your changes will impact the deployment pipeline and testing procedures
- **Version Control Consciousness**: Always work within the `--branch target` branch and maintain clear commit messages

### Prompt Context

Key information that Jules must keep in mind at all times:

- **Deployment Target**: Hugging Face Space at `harvesthealth/openoperator`
- **SDK Type**: Docker-based deployment
- **Branch Strategy**: Working exclusively on `--branch target`
- **Repository Purpose**: OpenOperator - likely a healthcare-related AI tool or framework
- **User Base**: Healthcare professionals and researchers
- **Technical Stack**: Python-based with potential ML/AI components
- **Security Considerations**: Healthcare data handling requirements
- **Compliance Requirements**: HIPAA/GDPR considerations (if applicable)

### Project File Integration

Follow these instructions for working with other project files:

#### Project_Overview.md
- Read and understand the complete project scope before making changes
- Reference the overview when creating new features or modifying existing ones
- Ensure any modifications align with the stated project goals

#### Requirements.txt/requirements.yaml
- Maintain dependency compatibility with Docker deployment
- Update dependencies only when necessary and well-tested
- Verify Docker image build process after dependency changes

#### Dockerfile
- Ensure all code changes are compatible with Docker build process
- Test local Docker builds before committing changes
- Pay attention to file paths and volume mappings

#### README.md
- Keep documentation updated with any functional changes
- Include clear installation and usage instructions for Docker deployment
- Add relevant examples and usage scenarios

#### Configuration Files
- Follow existing configuration patterns and naming conventions
- Maintain consistency with environment variable naming
- Ensure configuration files support both development and production environments

### Best Practices for Optimal Results

To achieve the best outcomes for this specific project:

1. **Healthcare Domain Expertise**
   - Understand medical terminology and healthcare workflows
   - Consider privacy and security implications of code changes
   - Ensure compliance with healthcare data handling standards

2. **Docker Optimization**
   - Minimize Docker image size through efficient layering
   - Use multi-stage builds where appropriate
   - Ensure proper .dockerignore configuration

3. **Hugging Face Space Compatibility**
   - Follow Hugging Face Space deployment guidelines
   - Ensure model loading and serving works correctly in space environment
   - Test accessibility of all endpoints and interfaces

4. **Code Quality Standards**
   - Write clean, well-documented Python code
   - Include type hints where appropriate
   - Follow PEP 8 style guidelines
   - Implement proper error handling and logging

5. **Performance Considerations**
   - Optimize memory usage for healthcare applications
   - Consider inference time for AI models if applicable
   - Implement caching strategies where beneficial

6. **Testing and Validation**
   - Create comprehensive test cases for core functionalities
   - Validate Docker deployment locally before pushing
   - Ensure all tests pass in the CI/CD pipeline

7. **User Experience Focus**
   - Prioritize intuitive interfaces for healthcare professionals
   - Provide clear error messages and guidance
   - Ensure responsive design for various device sizes

8. **Security Best Practices**
   - Never hardcode sensitive information
   - Implement proper authentication/authorization where needed
   - Regularly audit dependencies for security vulnerabilities

Remember to always communicate clearly about your approach and decisions, and ensure that every change contributes meaningfully to the overall goal of the OpenOperator project.