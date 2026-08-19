# Changelog

## [0.3.0](https://github.com/Miragon/miranum-clients/compare/client-dimacon-v0.2.0...client-dimacon-v0.3.0) (2026-08-19)


### Features

* **dimacon:** export generated types and zod schemas ([9fdecd8](https://github.com/Miragon/miranum-clients/commit/9fdecd8dcaca90696a7737330d0b2471ce34e9f3))
* export generated types, zod schemas and query helpers from clockin and dimacon ([6d0eb2a](https://github.com/Miragon/miranum-clients/commit/6d0eb2ae5dc56eb168fdf60f68a67e50fce93aab))

## [0.2.0](https://github.com/Miragon/miranum-clients/compare/client-dimacon-v0.1.0...client-dimacon-v0.2.0) (2026-08-19)


### ⚠ BREAKING CHANGES

* **dimacon:** several operations and transfer object types were renamed by the API: getAllProject -> getAllProjects, getOneTeam -> getTeam, createNewEnum -> createEnum, activateOrDeactivateEnum(Value) -> changeEnum(Value)Status, getServiceExecutionPdf -> getServiceExecutionAttachment/getServiceExecutionHistory, movePositionNrOfEnumValue -> movePositionOfEnumValue, getExpenseErrorCodes1 -> getExpenseErrorCodes, getAllAttributeGroups1 -> allAttributeGroups2, and NewXxxTo types are now CreateXxxCommandTo.

### Features

* **dimacon:** regenerate client for latest Dimacon API ([bba4d6f](https://github.com/Miragon/miranum-clients/commit/bba4d6f4eaf7c0a7cd1a27ffec9e6bc46a565a10))


### Bug Fixes

* **dimacon:** keep User-Agent version in sync with releases ([089a077](https://github.com/Miragon/miranum-clients/commit/089a077e1517fa7b0c09980f4ee672132f702139))
