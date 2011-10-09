// Finally, to show the variable argument list macro facilities:

#define debug(...)       fprintf(stderr, _ _VA_ARGS_ _)
#define showlist(...)    puts(#_ _VA_ARGS_ _)
#define report(test, ...) ((test)?puts(#test):\
            printf(_ _VA_ARGS_ _))
debug("Flag");
debug("X = %d\n", x);
showlist(The first, second, and third items.);
report(x>y, "x is %d but y is %d", x, y);

// results in
fprintf(stderr, "Flag" );
fprintf(stderr, "X = %d\n", x );
puts( "The first, second, and third items." );
((x>y)?puts("x>y"):
            printf("x is %d but y is %d", x, y));
