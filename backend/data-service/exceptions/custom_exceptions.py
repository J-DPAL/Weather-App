class NotFoundException(Exception):
    pass

class InvalidRequestException(Exception):
    pass

class DuplicateLocationException(Exception):
    """Raised when attempting to save a location that already exists."""
    pass

class DuplicateWeatherException(Exception):
    """Raised when attempting to save the same weather snapshot too soon for the same place."""
    pass
