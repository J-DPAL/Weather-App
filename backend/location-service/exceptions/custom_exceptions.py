"""
Custom exceptions used by the service.
Keep domain-specific exceptions here so the presentation layer can translate to HTTP.
"""
class LocationNotFoundException(Exception):
    pass

class ExternalAPIException(Exception):
    pass

class InvalidInputException(Exception):
    pass

class InvalidLocationException(Exception):
    """Raised when a location query returns no valid results"""
    pass
