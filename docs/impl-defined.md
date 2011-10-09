J.3 Implementation-defined behavior
===================================

1. A conforming implementation is required to document its choice of behavior in each of the areas listed in this subclause. The following are implementation-defined:

J.3.1 Translation
-----------------

* How a diagnostic is identified (3.10, 5.1.1.3).

Diagnostics are produced as a thrown exception object during any stage of program translation. A ParserError object is thrown. There it is given the property `message` and `args`. The `message` property is a human-readable representation of the diagnostic as a JavaScript string. The `args` property contains the object whose method produced the error where the line and column information can be deduced.

* Whether each nonempty sequence of white-space characters other than new-line is retained or replaced by one space character in translation phase 3 (5.1.1.2).

Each white-space character is retained by the tokenizer in translation phase 3.

J.3.2 Environment
-----------------

* The mapping between physical source file multibyte characters and the source character set in translation phase 1 (5.1.1.2).

  Input is interpreted as a JavaScript string (UTF-16). They are converted as processed as Unicode code points.

* The name and type of the function called at program startup in a freestanding environment (5.1.2.1).

  The implementation is a hosted environment.

* The effect of program termination in a freestanding environment (5.1.2.1).

  The implementation is a hosted environment.
  
* An alternative manner in which the `main` function may be defined (5.1.2.2.1).

  There is no alternative way to define `main` other than that defined in the standard.

* The values given to the strings pointed to by the argv argument to main (5.1.2.2.1).
* What constitutes an interactive device (5.1.2.3).
* The set of signals, their semantics, and their default handling (7.14).
* Signal values other than `SIGFPE`, `SIGILL`, and `SIGSEGV` that correspond to a computational exception (7.14.1.1).
* Signals for which the equivalent of `signal(sig, SIG_IGN);` is executed at program startup (7.14.1.1).
* The set of environment names and the method for altering the environment list used by the `getenv` function (7.20.4.5).
* The manner of execution of the string by the `system` function (7.20.4.6).

J.3.3 Identifiers
-----------------

* Which additional multibyte characters may appear in identifiers and their correspondence to universal character names (6.4.2).

  No additional multibyte characters may appear in identifiers other than what is defined in the standard.

* The number of significant initial characters in an identifier (5.2.4.1, 6.4.2).

  4294967295

J.3.4 Characters
----------------

* The number of bits in a byte (3.6).

  16

* The values of the members of the execution character set (5.2.1).

  Mapping is identical between source and execution characters.

* The unique value of the member of the execution character set produced for each of the standard alphabetic escape sequences (5.2.2).

<table>
  <thead>
    <tr>
      <th>Escape sequence</th>
      <th>Unique value</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>\a (alert)</td><td>7</td></tr>
    <tr><td>\b (backspace)</td><td>8</td></tr>
    <tr><td>\f (form feed)</td><td>12</td></tr>
    <tr><td>\n (newline)</td><td>10</td></tr>
    <tr><td>\r (carriage return)</td><td>13</td></tr>
    <tr><td>\t (horizontal tab)</td><td>9</td></tr>
    <tr><td>\v (vertical tab)</td><td>11</td></tr>
  </tbody>
</table>

* The value of a `char` object into which has been stored any character other than a member of the basic execution character set (6.2.5).
* Which of `signed char` or `unsigned char` has the same range, representation, and behavior as "plain" `char` (6.2.5, 6.3.1.1).
* The mapping of members of the source character set (in character constants and string literals) to members of the execution character set (6.4.4.4, 5.1.1.2).

  Mapping is identical between source and execution characters.
  
* The value of an integer character constant containing more than one character or containing a character or escape sequence that does not map to a single-byte execution character (6.4.4.4).

  A multiple-character constant that is not an escape sequence has a value derived from the numeric values of each character.

* The value of a wide character constant containing more than one multibyte character, or containing a multibyte character or escape sequence not represented in the extended execution character set (6.4.4.4).

  A multiple-character wide character constant that is not an escape sequence has a value derived from the numeric values of each character.

* The current locale used to convert a wide character constant consisting of a single multibyte character that maps to a member of the extended execution character set into a corresponding wide character code (6.4.4.4).
* The current locale used to convert a wide string literal into corresponding wide character codes (6.4.5).
* The value of a string literal containing a multibyte character or escape sequence not represented in the execution character set (6.4.5).

  Each byte of the multi-byte character forms a character of the string literal, with a value equivalent to the numerical value of that byte in the multi-byte character.

J.3.5 Integers
--------------

* Any extended integer types that exist in the implementation (6.2.5).

  None.

* Whether signed integer types are represented using sign and magnitude, twoâs complement, or onesâ complement, and whether the extraordinary value is a trap representation or an ordinary value (6.2.6.2).

  Signed integer types are represented as twoâs complement. Extraordinary value is an ordinary value.

* The rank of any extended integer type relative to another extended integer type with the same precision (6.3.1.1).

  There are no extended integer types.

* The result of, or the signal raised by, converting an integer to a signed integer type when the value cannot be represented in an object of that type (6.3.1.3).
* The results of some bitwise operations on signed integers (6.5).

  Bitwise operators act on the representation of the value including both the sign and value bits, where the sign bit is considered immediately above the highest-value value bit. Signed `>>` acts on negative numbers by sign extension.

J.3.6 Floating point
--------------------

* The accuracy of the floating-point operations and of the library functions in `<math.h>` and `<complex.h>` that return floating-point results (5.2.4.2.2).
* The accuracy of the conversions between floating-point internal representations and string representations performed by the library functions in `<stdio.h>`, `<stdlib.h>`, and `<wchar.h>` (5.2.4.2.2).
* The rounding behaviors characterized by non-standard values of `FLT_ROUNDS` (5.2.4.2.2).
* The evaluation methods characterized by non-standard negative values of `FLT_EVAL_METHOD` (5.2.4.2.2).
* The direction of rounding when an integer is converted to a floating-point number that cannot exactly represent the original value (6.3.1.4).
* The direction of rounding when a floating-point number is converted to a narrower floating-point number (6.3.1.5).
* How the nearest representable value or the larger or smaller representable value immediately adjacent to the nearest representable value is chosen for certain floating constants (6.4.4.2).
* Whether and how floating expressions are contracted when not disallowed by the `FP_CONTRACT` pragma (6.5).
* The default state for the `FENV_ACCESS` pragma (7.6.1).
* Additional floating-point exceptions, rounding modes, environments, and classifications, and their macro names (7.6, 7.12).
* The default state for the `FP_CONTRACT` pragma (7.12.2).

J.3.7 Arrays and pointers
-------------------------

* The result of converting a pointer to an integer or vice versa (6.3.2.3).
* The size of the result of subtracting two pointers to elements of the same array (6.5.6).

J.3.8 Hints
-----------

* The extent to which suggestions made by using the register storage-class specifier are effective (6.7.1).
* The extent to which suggestions made by using the inline function specifier are effective (6.7.4).

J.3.9 Structures, unions, enumerations, and bit-fields
------------------------------------------------------

* Whether a "plain" `int` bit-field is treated as a `signed int` bit-field or as an `unsigned int` bit-field (6.7.2, 6.7.2.1).
* Allowable bit-field types other than `_Bool`, `signed int`, and `unsigned int` (6.7.2.1).
* Whether a bit-field can straddle a storage-unit boundary (6.7.2.1).
* The order of allocation of bit-fields within a unit (6.7.2.1).
* The alignment of non-bit-field members of structures (6.7.2.1). This should present no problem unless binary data written by one implementation is read by another.
* The integer type compatible with each enumerated type (6.7.2.2).

J.3.10 Qualifiers
-----------------

* What constitutes an access to an object that has volatile-qualified type (6.7.3).

J.3.11 Preprocessing directives
-------------------------------

* The locations within `#pragma` directives where header name preprocessing tokens are recognized (6.4, 6.4.7).
* How sequences in both forms of header names are mapped to headers or external source file names (6.4.7).
* Whether the value of a character constant in a constant expression that controls conditional inclusion matches the value of the same character constant in the execution character set (6.10.1).
* Whether the value of a single-character character constant in a constant expression that controls conditional inclusion may have a negative value (6.10.1).
* The places that are searched for an included `< >` delimited header, and how the places are specified or the header is identified (6.10.2).
* How the named source file is searched for in an included " " delimited header (6.10.2).
* The method by which preprocessing tokens (possibly resulting from macro expansion) in a `#include` directive are combined into a header name (6.10.2).
* The nesting limit for `#include` processing (6.10.2).
* Whether the `#` operator inserts a `\` character before the `\` character that begins a universal character name in a character constant or string literal (6.10.3.2).
* The behavior on each recognized non-STDC `#pragma directive (6.10.6).
* The definitions for `__DATE__` and `__TIME__` when respectively, the date and time of translation are not available (6.10.8).

J.3.12 Library functions
------------------------

* Any library facilities available to a freestanding program, other than the minimal set required by clause 4 (5.1.2.1).
* The format of the diagnostic printed by the `assert` macro (7.2.1.1).
* The representation of the floating-point status flags stored by the `fegetexceptflag` function (7.6.2.2).
* Whether the `feraiseexcept` function raises the "inexact" floating-point exception in addition to the "overflow" or "underflow" floating-point exception (7.6.2.3).
* Strings other than `"C"` and `""` that may be passed as the second argument to the `setlocale` function (7.11.1.1).
* The types defined for `float_t` and `double_t` when the value of the `FLT_EVAL_METHOD` macro is less than 0 (7.12).
* Domain errors for the mathematics functions, other than those required by this International Standard (7.12.1).
* The values returned by the mathematics functions on domain errors (7.12.1).
* The values returned by the mathematics functions on underflow range errors, whether `errno` is set to the value of the macro `ERANGE` when the integer expression `math_errhandling & MATH_ERRNO` is nonzero, and whether the "underflow" floating-point exception is raised when the integer expression `math_errhandling & MATH_ERREXCEPT` is nonzero. (7.12.1).
* Whether a domain error occurs or zero is returned when an `fmod` function has a second argument of zero (7.12.10.1).
* Whether a domain error occurs or zero is returned when a remainder function has a second argument of zero (7.12.10.2).
* The base-2 logarithm of the modulus used by the `remquo` functions in reducing the quotient (7.12.10.3).
* Whether a domain error occurs or zero is returned when a `remquo` function has a second argument of zero (7.12.10.3).
* Whether the equivalent of `signal(sig, SIG_DFL);` is executed prior to the call of a signal handler, and, if not, the blocking of signals that is performed (7.14.1.1).
* The null pointer constant to which the macro `NULL` expands (7.17).
* Whether the last line of a text stream requires a terminating new-line character (7.19.2).
* Whether space characters that are written out to a text stream immediately before a new-line character appear when read in (7.19.2).
* The number of null characters that may be appended to data written to a binary stream (7.19.2).
* Whether the file position indicator of an append-mode stream is initially positioned at the beginning or end of the file (7.19.3).
* Whether a write on a text stream causes the associated file to be truncated beyond that point (7.19.3).
* The characteristics of file buffering (7.19.3).
* Whether a zero-length file actually exists (7.19.3).
* The rules for composing valid file names (7.19.3).
* Whether the same file can be simultaneously open multiple times (7.19.3).
* The nature and choice of encodings used for multibyte characters in files (7.19.3).
* The effect of the `remove` function on an open file (7.19.4.1).
* The effect if a file with the new name exists prior to a call to the `rename` function (7.19.4.2).
* Whether an open temporary file is removed upon abnormal program termination (7.19.4.3).
* Which changes of mode are permitted (if any), and under what circumstances (7.19.5.4).
* The style used to print an `infinity` or `NaN`, and the meaning of any n-char or n-wchar sequence printed for a `NaN` (7.19.6.1, 7.24.2.1).
* The output for `%p` conversion in the `fprintf` or `fwprintf` function (7.19.6.1, 7.24.2.1).
* The interpretation of a `-` character that is neither the first nor the last character, nor the second where a `^` character is the first, in the scanlist for `%[` conversion in the `fscanf` or `fwscanf` function (7.19.6.2, 7.24.2.1).
* The set of sequences matched by a `%p` conversion and the interpretation of the corresponding input item in the fscanf or fwscanf function (7.19.6.2, 7.24.2.2).
* The value to which the macro `errno` is set by the `fgetpos`, `fsetpos`, or `ftell` functions on failure (7.19.9.1, 7.19.9.3, 7.19.9.4).
* The meaning of any n-char or n-wchar sequence in a string representing a `NaN` that is converted by the `strtod`, `strtof`, `strtold`, `wcstod`, `wcstof`, or `wcstold` function (7.20.1.3, 7.24.4.1.1).
* Whether or not the `strtod`, `strtof`, `strtold`, `wcstod`, `wcstof`, or `wcstold` function sets `errno` to `ERANGE` when underflow occurs (7.20.1.3, 7.24.4.1.1).
* Whether the `calloc`, `malloc`, and `realloc` functions return a null pointer or a pointer to an allocated object when the size requested is zero (7.20.3).
* Whether open streams with unwritten buffered data are flushed, open streams are closed, or temporary files are removed when the `abort` or `_Exit` function is called (7.20.4.1, 7.20.4.4).
* The termination status returned to the host environment by the `abort`, `exit`, or `_Exit` function (7.20.4.1, 7.20.4.3, 7.20.4.4).
* The value returned by the `system` function when its argument is not a null pointer (7.20.4.6).
* The local time zone and Daylight Saving Time (7.23.1).
* The range and precision of times representable in `clock_t` and `time_t` (7.23).
* The era for the clock function (7.23.2.1).
* The replacement string for the `%Z` specifier to the `strftime`, and `wcsftime` functions in the "C" locale (7.23.3.5, 7.24.5.1).
* Whether the functions in `<math.h>` honor the rounding direction mode in an IEC 60559 conformant implementation, unless explicitly specified otherwise (F.9).

J.3.13 Architecture
-------------------

* The values or expressions assigned to the macros specified in the headers `<float.h>`, `<limits.h>`, and `<stdint.h>` (5.2.4.2, 7.18.2, 7.18.3).
* The number, order, and encoding of bytes in any object (when not explicitly specified in this International Standard) (6.2.6.1).
* The value of the result of the sizeof operator (6.5.3.4).
