var Type = function(name, storage, qualifiers, type, list) {
	this.name = name;
	this.storage = storage;
	this.qualifiers = qualifiers;
	this.type = type;
	if (type === Type.TS_pointer) {
		this.pointed = name_or_type;
	} else {
		this.name = name_of_type;
	};
	this.list = list;
};

// Storage classes
Type.SC_extern    = 1 << 0;
Type.SC_static    = 1 << 1;
Type.SC_auto      = 1 << 2;
Type.SC_register  = 1 << 3;

// Type specifiers
Type.TS_pointer   = 0;
Type.TS_void      = 1 << 0;
Type.TS_char      = 1 << 1;
Type.TS_short     = 1 << 2;
Type.TS_int       = 1 << 3;
Type.TS_long      = 1 << 4;
Type.TS_float     = 1 << 5;
Type.TS_double    = 1 << 6;
Type.TS_signed    = 1 << 7;
Type.TS_unsigned  = 1 << 8;
Type.TS__Bool     = 1 << 9;
Type.TS__Complex  = 1 << 10;
Type.TS_struct    = 1 << 11;
Type.TS_union     = 1 << 12;
Type.TS_enum      = 1 << 13;

// Type qualifiers
Type.TQ_const     = 1 << 0;
Type.TQ_restrict  = 1 << 1;
Type.TQ_volatile  = 1 << 2;
