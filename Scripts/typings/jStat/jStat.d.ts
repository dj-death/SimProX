// Type definitions for jstat 1.4.6
// Project: https://github.com/jstat/jstat
// Definitions by: Matt Poegel <https://github.com/mpoegel/>



declare module "jstat" {
    interface jStat {
        /**
         * Returns the count of rows in a matrix.
         *
         * var matrix = [[1,2,3],[4,5,6]];
         * jStat.rows( matrix ) === 2;
         */
         rows(): number;

        /**
         * Returns the number of columns in a matrix.
         */
         cols(): number;

        /**
         * Returns an object with the dimensions of a matrix.
         *
         * var matrix = [[1,2,3],[4,5,6]];
         * jStat.dimensions( matrix ) === { cols: 3, rows: 2 };
         */
         dimensions(): { cols: number, rows: number };

        /**
         * Returns a specified row of a matrix.
         *
         * var matrix = [[1,2,3],[4,5,6]];
         * jStat.row( matrix, 0 ) === [1,2,3];
         */
         row( index: number): number[][];


        /**
         * Returns the specified column as a column vector.
         *
         * var matrix = [[1,2],[3,4]];
         * jStat.col( matrix, 0 ) === [[1],[3]];
         */
         col( index: number): number[][];

        /**
         * Returns the diagonal of a matrix.
         *
         * var matrix = [[1,2,3],[4,5,6],[7,8,9]];
         * jStat.diag( matrix ) === [[1],[5],[9]];
         */
         diag(): number[][];

        /**
         * Returns the anti-diagonal of the matrix.
         *
         * var matrix = [[1,2,3],[4,5,6],[7,8,9]];
         * jStat.antidiag( matrix ) === [[3],[5],[7]];
         */
         antidiag(): number[][];

        /**
         * Transpose a matrix.
         *
         * var matrix = [[1,2],[3,4]];
         * jStat.transpose( matrix ) === [[1,3],[2,4]];
         */
         transpose(): number[][];

         map(func: Function);

        /**
         * Cumulatively reduce values using a  and return a new object.
         */
         cumreduce(func: Function);


         alter(func: Function);


        /**
         * Create a row by col matrix using the supplied  If col is omitted then it will default to value row.
         */
         create(row: number, col?: number): number[][];

        /**
         * Create a row by col matrix of all zeros. If col is omitted then it will default to value row.
         *
         * jStat.zeros( 2 ) // returns [[0,0],[0,0]]
         */
         zeros(): number[][];

        /**
         * Create a row by col matrix of all ones. If col is omitted then it will default to value row.
         *
         * jStat().ones( 2 ); // returns jStat([[0,0],[0,0]])
         */
         ones(row: number, col?: number): number[][];

        /**
         * Create a matrix of normally distributed random numbers. If col is omitted then it will default to value row.
         *
         */
         rand(row: number, col?: number): number[][];

        /**
         * Create an identity matrix of row by col. If col is omitted then it will default to value row.
         *
         * jStat.identity( 2 ) // returns [[1,0],[0,1]]
         */
         identity(row: number, col?: number): number[][];

        /**
         * Set all values in the vector or matrix to zero.
         *
         * var tmp = [1,2,3];
         * jStat.clear( tmp ) // tmp === [0,0,0]
         */
         clear(): number[];

        /**
         * Tests if a matrix is symmetric.
         */
         symmetric(matrix: number[][]): boolean;

	    /**
	     * Defines methods on a Normal Distribution.
	     */

         sum(): number

        /**
         * Return the sum squared of a vector.
         */
         sumsqrd(): number;

        /**
         * Return the sum of squared errors of prediction of a vector.
         */
         sumsqerr(): number;

        /**
         * Return the sum of a vector in row-based order.
         */
         sumrow(): number;

        /**
         * Return the product of a vector.
         */
         product(): number;

        /**
         * Return the minimum value of a vector.
         */
         min(): number;

        /**
         * Return the max value of a vector.
         */
         max(): number;

        /**
         * Return the mean of a vector.
         */
         mean();

        /**
         * Return the mean squared error of a vector.
         */
         meansqerr(): number;

        /**
         * Return the geometric mean of a vector.
         */
         geomean(): number;

        /*
        jStat.harmonicmean = function harmonicmean(arr) {
	        ver inversesSum = 0;

	        arr.forEach(function (value) {
		        let inverse = 1 / value;
		        inversesSum += inverse;
	        });

	        return arr.length / inversesSum;
        };

        */

         /**
          * Return the harmonic mean of a vector.
          */
         harmonicmean(): number;

        /*

        /**
         * Return the median of a vector.
         *
         * jStat.median([1,2,3]) === 2
         */
         median(): number;

        /**
         * Return an array of partial sums in the sequence.
         *
         * jStat.cumsum([1,2,3]) === [1,3,6]
         */
         cumsum(): number[];

        /**
         * Return an array of partial products in the sequence.
         *
         * jStat.cumprod([2,3,4]) === [2,6,24]
         */
         cumprod(): number[];

        /**
         * Return an array of the successive differences of the array.
         *
         * jStat.diff([1,2,2,3]) === [1,0,1]
         */
         diff(): number[];

        /**
         * Return the mode of a vector. If there are multiple modes then mode() will return all of them.
         */
         mode(): number;
         mode(): number[];

        /**
         * Return the range of a vector
         */
         range(): number;

        /**
         * Return the variance of a vector.
         * By default, the population variance is calculated.
         * Passing true as the flag indicates computes the sample variance instead.
         */
         variance( flag?: boolean): number;

        /**
         * Return the standard deviation of a vector.
         * By defaut, the population standard deviation is returned.
         * Passing true for the flag parameter returns the sample standard deviation.
         * The 'sample' standard deviation is also called the 'corrected standard deviation',
         * and is an unbiased estimator of the population standard deviation. The population standard deviation is also the 'uncorrected standard deviation', and is a biased but minimum-mean-squared-error estimator.
         *
         * jStat.stdev([1,2,3,4]) === 1.118...
         * jStat.stdev([1,2,3,4],true) === 1.290...
         */
         stdev( flag?: boolean): number;

        /**
         * Return the mean absolute deviation of a vector.
         *
         * jStat.meandev([1,2,3,4]) === 1
         */
         meandev(): number;

        /**
         * Return the median absolute deviation of a vector.
         *
         * jStat.meddev([1,2,3,4]) === 1
         */
         meddev(): number;

        /**
         * Return the skewness of a vector (third standardized moment).
         */
         skewness(): number;

        /**
         * Return the excess kurtosis of a vector (fourth standardized moment - 3).
         */
         kurtosis(): number;


        /**
         * Return the coefficient of variation of a vector.
         */
         coeffvar(): number;

        /**
         * Return the quartiles of a vector.
         */
         quartiles(): number;

        /**
         * Like quartiles, but calculate and return arbitrary quantiles of a vector or matrix (column-by-column).
         *
         * jStat.quantiles([1, 2, 3, 4, 5, 6], [0.25, 0.5, 0.75]) === [1.9375, 3.5, 5.0625]
         */
         quantiles(data, quantiles, alphap?: number, betap?: number): number;

        /**
         * Return the k-th percentile of values in a range, where k is in the range 0..1, exclusive.
         */
         percentile(data, k: number): number;

        /**
         * The percentile rank of score in a given array.
         * Returns the percentage of all values in the input array that are less than (if kind == 'strict')
         * or less or equal than (if kind == 'weak') score. Default is 'weak'.
         */
         percentileOfScore(data, score?: number, kind?: string): number;

        /**
         * The histogram data defined as the number of dataArray elements
         * found in equally sized bins across the range of dataArray.
         * Default number of bins is 4.
         *
         * jStat.histogram([100, 101, 102, 230, 304, 305, 400], 3) === [3, 1, 3];
         */
         histogram(data, numBins?: number): number;

        /**
         * Return the covariance of two vectors.
         */
         covariance(arr1: number[], arr2: number[]): number;

        /**
         * Return the population correlation coefficient of two vectors (Pearson's Rho)
         */
         corrcoeff(arr1: number[], arr2: number[]): number;


         /**
          * Raise all entries by value.
          *
          * jStat([[1, 2, 3]]).pow(2) === [[1, 4, 9]];
          */

         pow(exponent: number): jStat;

         toArray(): Array<any>;


         normal: {
             sample: (mean: number, sd: number) => number;
         }


    }

    export function jStat(arr: number[] | number[][]): jStat;

}
