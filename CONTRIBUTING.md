# Contributing to WeatherApp

Thank you for your interest in contributing to WeatherApp! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/weather-app.git
   cd weather-app
   ```
3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/J-DPAL/weather-app.git
   ```
4. **Set up the development environment** (see README.md)

## 🔄 Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards below

3. **Test your changes:**
   - Run backend services and verify endpoints
   - Test frontend UI and functionality
   - Ensure no breaking changes

4. **Commit your changes** (see commit guidelines)

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

## 📝 Coding Standards

### Python (Backend)

- Follow **PEP 8** style guide
- Use **type hints** for function parameters and return values
- Write **docstrings** for classes and functions
- Use **async/await** for I/O operations
- Format code with `black` or `ruff`:
  ```bash
  black backend/
  ```

**Example:**
```python
async def get_weather_data(lat: float, lng: float) -> dict:
    """
    Fetch current weather data for given coordinates.
    
    Args:
        lat: Latitude
        lng: Longitude
        
    Returns:
        dict: Weather data snapshot
    """
    # Implementation
```

### JavaScript/React (Frontend)

- Use **functional components** with hooks
- Follow **ESLint** configuration
- Use **meaningful variable names**
- Keep components **small and focused**
- Use **arrow functions** for consistency

**Example:**
```jsx
export default function WeatherCard({ temperature, description }) {
  const [isCelsius, setIsCelsius] = useState(true);

  const displayTemp = isCelsius 
    ? temperature 
    : (temperature * 9/5) + 32;

  return (
    <div className="weather-card">
      <p>{displayTemp.toFixed(1)}°{isCelsius ? 'C' : 'F'}</p>
      <p>{description}</p>
    </div>
  );
}
```

### File Organization

- **Backend:** Follow layered architecture (presentation → business → data → domain)
- **Frontend:** Group by feature/page, not by file type
- **Tests:** Mirror source structure in `tests/` directory

## 💬 Commit Guidelines

Use conventional commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples:
```bash
feat(weather): add temperature unit conversion
fix(location): handle invalid coordinates gracefully
docs(readme): update installation instructions
refactor(data-service): extract duplicate code into helper
```

## 🔍 Pull Request Process

1. **Update documentation** if needed (README, API docs, comments)
2. **Ensure all tests pass** and no linting errors
3. **Update CHANGELOG.md** if applicable
4. **Provide clear PR description:**
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots for UI changes

### PR Template:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Steps to test the changes:
1. ...
2. ...

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

## 🐛 Reporting Issues

### Bug Reports

Include:
- **Description:** Clear description of the bug
- **Steps to Reproduce:** Numbered steps to reproduce the issue
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Environment:** OS, browser, Docker version, etc.
- **Screenshots:** If applicable
- **Logs:** Error messages or relevant logs

### Feature Requests

Include:
- **Problem:** What problem does this solve?
- **Solution:** Proposed solution
- **Alternatives:** Alternative solutions considered
- **Additional Context:** Mockups, examples, etc.

## 🎯 Areas for Contribution

### High Priority
- 🧪 **Test Coverage:** Add unit and integration tests
- ♿ **Accessibility:** Improve ARIA labels, keyboard navigation
- 🌍 **Internationalization:** Add multi-language support
- 📊 **Analytics:** Track user interactions and errors

### Features
- ⏰ **Weather Alerts:** Severe weather notifications
- ⭐ **Favorites:** Save favorite locations
- 📈 **Trends:** Visualize temperature trends over time
- 🗺️ **Multiple Markers:** Show multiple locations on map
- 🔔 **Notifications:** Browser push notifications

### Improvements
- 🎨 **UI/UX:** Design enhancements, animations
- ⚡ **Performance:** Code splitting, lazy loading, caching
- 🔐 **Security:** Input validation, rate limiting, authentication
- 📱 **PWA:** Convert to Progressive Web App

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

## ❓ Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

---

**Thank you for contributing to WeatherApp! 🙏**
