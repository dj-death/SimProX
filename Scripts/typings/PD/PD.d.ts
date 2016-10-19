declare module "probability-distributions" {
    /**
     * This is the core function for generating entropy
     *
     * @param len number of bytes of entropy to create
     * @returns {number} A pseduo random number between 0 and 1
     *
     */
    function prng(len: number): number;

    /**
     * Binomial:
     * return an Array of 7 binomial variates based on n trials with probability p
     * PD.rbinom(7, 12, 0.2)

     * @param n Number of variates to return.
     * @param size Number of Bernoulli trials to be summed up. Defaults to 1
     * @param p Probability of a "success". Defaults to 0.5
     * @returns {Array} Random variates array
     */
    function rbinom(n: number, size?: number, p?: number): number[];

    /**
     * Beta:
     * return an Array of varsNb beta variates with shape parameters alpha and beta
     *
     * @param n The number of random variates to create. Must be a positive integer.
     * @param alpha First shape parameter
     * @param beta Second shape parameter
     * @param loc Location or Non-centrality parameter
     */
    function rbeta(n: number, alpha: number, beta: number, loc?: number): number[];

    /**
     * Cauchy:
     * return an Array of x Cauchy variates with scale 2 and location -3
     *
     * @param n The number of variates to create
     * @param loc Location parameter
     * @param scale Scale parameter
     * @returns {Array} Random variates array
     */

    function rchauchy(n: number, loc: number, scale: number): number[];

    /**
     * KHI2
     * return a nArray of x Chi Square variates with d degrees of freedom
     *
     * @param n The number of variates to create
     * @param df Degrees of freedom for the distribution
     * @param ncp Non-centrality parameter
     * @returns {Array} Random variates array
     */
    function rchisq(n: number, df: number, ncp?: number): number[];


    /**
     * Std Exponential Density
     * @param x Where to sample the density
     * @param rate The rate parameter. Must be a positive number
     * @returns {Number} The density given the parameter values
     */
    function dexp(x: number, rate: number): number;

    /**
     * Std Exponential:
     * return an Array of x standard exponential variates
     *
     * @param n The number of random variates to create. Must be a positive integer.
     * @param rate The rate parameter. Must be a positive number
     */
    function rexp(varsNb: number, rate?: number): number[];



    /**
     * F-Distribution:
     * return an array of x F-distribution variates on df1 and df2 degrees of freedom
     * @param n The number of variates to create
     * @param df1 Degrees of freedom for the first parameter
     * @param df2 Degrees of freedom for the first parameter
     * @returns {Array} Random variates array
     */
    function rf(n: number, df1: number, df2: number): number[];

    /**
     * Laplace:
     * return an Array of x standard Laplace variates
     *
     * @param n The number of random variates to create. Must be a positive integer
     * @param loc Mean
     * @param scale Scale parameter
     * @returns {Array} Random variates array
     */

    function rlaplace(varsNb: number, loc?: number, scale?: number): number[];


    /**
     * Gamma:
     *
     * @param n The number of random variates to create. Must be a positive integer
     * @param alpha
     * @param rate
     * @returns {Array} Random variates array
     */
    function rgamma(n: number, alpha: number, rate: number): number[];


    /**
     * Log-normal:
     *
     * return an Array of x log normal variates with log of mean  and log of standard deviation
     *
     * @param n The number of random variates to create. Must be a positive integer.
     * @param meanlog The mean log.
     * @param sdlog Log SD. Must be greater than 0.
     * @returns {Array} Random variates array
     */
    function rlnorm(n: number, meanlog: number, sdlog: number): number[];



    /**
     * Negative Binomial:
     *
     * return an Array of x negative binomial variates where we count the number of failures before n successes,
     * with the probability of success set to p
     *
     * @param n The number of random variates to create. Must be a positive integer.
     * @param size Number of hits required - default 1
     * @param p Hit probability
     * @param mu Optional way to specify hit probability
     * @returns {Array} Random variates array
     */
    function rnbinom(n: number, size?: number, p?: number, mu?: number): number[];



    /**
     * Normal (Gaussian):
     *
     * return an Array of x normal variates with mean  and standard deviation
     *
     * @param n The number of random variates to create. Must be a positive integer.
     * @param mean Mean of the distribution
     * @param sd Standard Deviation of the distribution
     * @returns {Array} Random variates array
     */
    function rnorm(n: number, mean?: number, sd?: number): number[];


    /**
     * Normal (Gaussian) Density
     *
     * @param x Where to sample the density
     * @param mean Mean of the distribution
     * @param sd Standard deviation for the distribution
     * @returns {Number} The density given the parameter values
     */
    function dnorm(x: number, mean?: number, sd?: number): number;


    /**
     * Poisson density
     *
     * @param x Where to sample the density
     * @param lambda Mean/variance
     * @returns {Number} The density given the parameter values
     */
    function dpois(x: number, mean: number): number;


    /**
     * Poisson:
     *
     * return an Array of x poisson variates with mean/variance

     * @param n The number of random variates to create. Must be a positive integer.
     * @param lambda Mean/Variance of the distribution
     * @returns {Array} Random variates array
     */
    function rpois(n: number, landa: number): number[];


    /**
     * Uniform:
     *
     * return an Array of x numbers uniformly sampled from min to max
     * @param n  Number of variates to return
     * @param min Lower bound  - 0
     * @param max Upper bound  - 1
     * @returns {Array} Random variates array
     */
    function runif(n: number, min?: number, max?: number): number[];

    /**
     * Density function for uniform distribution
     *
     * @param x Location to get density for
     * @param min {number } Minimum value - default 0
     * @param max {number } Maximum value - default 1
     * @returns { number } Density of the function given the location and parameters
     */
    function dunif(w: number, min?: number, max?: number): number;


    /**
     * Uniform (whole numbers):
     *
     * return an Array of x uniform variates from min to max inclusive (default true), only whole numbers
     *
     * @param n The number of random variates to create. Must be a positive integer
     * @param min Minimum value
     * @param max Maximum value
     * @param inclusive By default the minimum and maximum are inclusive. To make exclusive, set to false
     * @returns {Array}
     */
    function rint(n: number, min: number, max: number, isInclusive?: boolean): number[];



    /**
     *
     * @param collection Array of items to sample from
     * @param n Number of items to sample. If missing, n will be set to the length of the collection and it will shuffle
     * @param replace Sample with replacement? False by default
     * @param ratios Ratios to weight items. Can be any non-negative number. By default all items are given equal weight
     * @returns {Array} Array of sampled items
     */
    function sample(collection: number[], n?: number, replace?: boolean, ratios?: number[]): number[];
}