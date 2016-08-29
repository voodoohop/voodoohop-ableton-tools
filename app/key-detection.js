"use strict";

// Key detection algorithm, as described at:
//  http://rnhart.net/articles/key-finding/

// (from this web site) ....
//  Krumhansl-Schmuckler key-finding algorithm (by Carol L. Krumhansl
//  and Mark A. Schmuckler). The profile numbers came from experiments
//  done by Krumhansl and Edward J. Kessler. The experiments consisted
//  of playing a set of context tones or chords, playing a probe tone,
//  and asking a listener to rate how well the probe tone fit with the
//  context. You can read about the experiments and the algorithm in
//  Krumhansl's book Cognitive Foundations of Musical Pitch. (The
//  experiments are described in Chapter 2. The key-finding algorithm
//  is described in Chapter 4.) You may be able to read portions of
//  the book on Google Books.


function khMean(vals) 
{
    var len = vals.length;
    if (len==0) {
	return 0;
    }

    var total = 0;

    for (var i=0; i<len; i++) {
	total += vals[i];
    }

    return total/len;
}

function khUnbiased(vals) 
{
    var unbiased_vals = [];

    var len = vals.length;
    if (len==0) {
	return unbiased_vals;
    }

    var avg = khMean(vals);

    for (var i=0; i<len; i++) {
	unbiased_vals.push(vals[i] - avg)
    }

    return unbiased_vals;
}


function khCorrelationCoefficientUnbiased(a1,a2)
{
    var a1_len = a1.length;
    var a2_len = a2.length;
   
    if (a1_len != a2_len) {
	throw "khCorrelationCoefficientUnbiased(): arrays should be of the same length (" + a1_len + " vs " + a2_len + ")";
    }
    var len = a1_len;

    var a1_a2_pair_prod = 0;
    var a1_square = 0;
    var a2_square = 0;

    for (var i=0; i<len; i++) {
	a1_a2_pair_prod += (a1[i]*a2[i]);
	a1_square += (a1[i]*a1[i]);
	a2_square += (a2[i]*a2[i]);	
    }

    return a1_a2_pair_prod / Math.sqrt(a1_square * a2_square);
}


//major profile
//do	do#	re	re#	mi	fa	fa#	so	so#	la	la#	ti
//6.35	2.23	3.48	2.33	4.38	4.09	2.52	5.19	2.39	3.66	2.29	2.88

//minor profile
//la	la#	ti	do	do#	re	re#	mi	fa	fa#	so	so#
//6.33	2.68	3.52	5.38	2.60	3.53	2.54	4.75	3.98	2.69	3.34	3.17


// kh = Krumhansl

var kh_major_profile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88 ];

var kh_minor_profile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17 ];

var kh_major_profile_unbiased = khUnbiased(kh_major_profile);

var kh_minor_profile_unbiased = khUnbiased(kh_minor_profile);


function khCreatePairing(profile,chromatic_scale_durations,offset)
{
    var p = [];
    var c = [];
    for (var i=0; i<12; i++) {
	p.push(profile[i])
	c.push(chromatic_scale_durations[(i+offset)%12]);
    }
    

    return {"p":p, "c":c};
}


function khCreateAllPairings(chromatic_scale_durations_unbiased,major_profile_unbiased,minor_profile_unbiased)
{
    // chromatic_scale_durations.length = 12

    var chromatic_keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    var major_pairings = {};
    var minor_pairings = {};

    // Foreach scale
    for (var s=0; s<12; s++) {
	var scale = chromatic_keys[s];

	major_pairings[scale] = khCreatePairing(major_profile_unbiased,chromatic_scale_durations_unbiased,s);
	minor_pairings[scale] = khCreatePairing(minor_profile_unbiased,chromatic_scale_durations_unbiased,s);
    }

    return {"major" : major_pairings, "minor" : minor_pairings};
}

function khComputeKeyCorrelationCoefficients(key_pairings_unbiased)
{
    var correlations = {};

    var keys = Object.keys(key_pairings_unbiased);
    var keys_len = keys.length;

    for (var k=0; k<keys_len; k++) {
	
	var key = keys[k];
	var key_pairing_unbiased = key_pairings_unbiased[key];

	var correlation_coeff = khCorrelationCoefficientUnbiased(key_pairing_unbiased.p,key_pairing_unbiased.c);
	correlations[key] = correlation_coeff;
    }

    return correlations;
}


function khComputeAllCorrelationCoefficients(pairings_unbiased)
{
    var major_correlation = khComputeKeyCorrelationCoefficients(pairings_unbiased.major);
    var minor_correlation = khComputeKeyCorrelationCoefficients(pairings_unbiased.minor);

    return {"major" : major_correlation, "minor" : minor_correlation};
}

function khFindMaxCorrelation(alignments)
{
    var max_val = 0;
    var max_key = null;

    var major_minor = [ "major", "minor" ];

    for (var m=0; m<major_minor.length; m++) {
	var mm = major_minor[m];
	var mm_alignment = alignments[mm];

	var mm_keys = Object.keys(mm_alignment);

	for (var k=0; k<mm_keys.length; k++) {
	    var key = mm_keys[k];
	    var correlation_coeff = mm_alignment[key];
	    if (correlation_coeff>max_val) {
		max_val = correlation_coeff;
		max_key = key + " (" + mm + ")";
	    }
	}
    }    
	
    return { "key": max_key, "score": max_val };
}

function khKeyDetection(chromatic_scale_durations)
{
    // Work out durations of MIDI events folded into octave (60=Middle-C)
    // (unbiased data)

    //var chromatic_scale_durations = [ 432, 231, 0, 405, 12, 316, 4, 126, 612, 0, 191, 1];
    var chromatic_scale_durations_unbiased = khUnbiased(chromatic_scale_durations);

    // Generate all (unbiased) pairings
    var kh_pairings_unbiased = khCreateAllPairings(chromatic_scale_durations_unbiased,kh_major_profile_unbiased,kh_minor_profile_unbiased)

    // Compute Correlation Coefficients
    var kh_alignments = khComputeAllCorrelationCoefficients(kh_pairings_unbiased);

    // Pick highest values
    
    var strongest_profile = khFindMaxCorrelation(kh_alignments);

    console.log("Predicted Key: " + JSON.stringify(strongest_profile));

    return strongest_profile;

}


