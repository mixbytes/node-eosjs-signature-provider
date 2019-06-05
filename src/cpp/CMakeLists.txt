cmake_minimum_required(VERSION 3.5)

project(node_eos_signature_provider)

set( CMAKE_EXPORT_COMPILE_COMMANDS "ON" )
set( CMAKE_CXX_STANDARD 14 )
set( CMAKE_CXX_EXTENSIONS ON )
set( CXX_STANDARD_REQUIRED ON )
set( CMAKE_POSITION_INDEPENDENT_CODE ON )

set(BOOST_SYSTEM_NO_DEPRECATED)
SET(Boost_USE_STATIC_LIBS ON CACHE STRING "ON or OFF")

include_directories(/usr/local/include/node)

# add defaults for openssl
if ("${OPENSSL_ROOT_DIR}" STREQUAL "")
    if (NOT "$ENV{OPENSSL_ROOT_DIR}" STREQUAL "")
        set(OPENSSL_ROOT_DIR $ENV{OPENSSL_ROOT_DIR})
        set(OPENSSL_INCLUDE_DIR ${OPENSSL_ROOT_DIR}/include)
    elseif (APPLE)
        set(OPENSSL_ROOT_DIR "/usr/local/opt/openssl@1.0")
        set(OPENSSL_INCLUDE_DIR "/usr/local/opt/openssl/include@1.0")
    elseif (UNIX AND NOT APPLE)
        set(OPENSSL_ROOT_DIR "/usr/include/openssl")
        set(OPENSSL_INCLUDE_DIR "/usr/include/openssl/include")
    else ()
        message(FATAL_ERROR "openssl not found and don't know where to look, please specify OPENSSL_ROOT_DIR")
    endif ()
endif ()

# Include BoostLib module
file(GLOB_RECURSE boostlib_cmake_path "${CMAKE_CURRENT_SOURCE_DIR}/../../../node_modules" "../../../BoostLib.cmake")
list(GET boostlib_cmake_path 0 boostlib_cmake_path)
get_filename_component(boostlib_cmake_path "${boostlib_cmake_path}" DIRECTORY)
list(APPEND CMAKE_MODULE_PATH "${boostlib_cmake_path}")
include(BoostLib)

# Locate/Download Boost (semver)
#find_package( Boost COMPONENTS system filesystem REQUIRED )
require_boost_libs("= 1.66.0" filesystem;coroutine)
include_directories(${Boost_INCLUDE_DIRS})

# Essential include files to build a node addon,
# you should add this line in every CMake.js based project.
include_directories(${CMAKE_JS_INC})
include_directories("${CMAKE_CURRENT_SOURCE_DIR}/../../../node_modules/node-addon-api")
include_directories("${CMAKE_CURRENT_SOURCE_DIR}/../../../node_modules/node-addon-api/src")

list(APPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/lib/fc/CMakeModules")
include(GNUInstallDirs)
include(SetupTargetMacros)
set(SKIP_FC_TESTS true)
add_subdirectory(lib)

# Declare the location of the source files
file(GLOB SOURCE_FILES "node_eos_signature_provider.cpp")

# This line will tell CMake that we're building a shared library
# from the above source files
# named after the project's name
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB} ${Boost_LIBRARIES} fc)
