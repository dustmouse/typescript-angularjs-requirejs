/* The MIT License (MIT)
 *
 * Copyright (c) 2015 Cyril Schumacher.fr
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/// <reference path="../typing/angularjs/angular.d.ts" />
/// <reference path="../typing/angularjs/angular-route.d.ts" />

/**
 * @summary Application routing configuration.
 * @author  Cyril Schumacher
 * @class
 */
class RouteConfiguration {
    /**
     * @summary Dependencies injection.
     * @public
     * @type {Array<string>}
     */
    public static $inject: Array<string> = ["$routeProvider", "appConfig"];

    /**
     * @summary Constructor.
     * @constructs
     * @public
     * @param {IRouteProvider} $routeProvier Route provider.
     * @param {any}            appConfig     Application configuration.
     */
    public constructor(private $routeProvider: ng.route.IRouteProvider, private appConfig: any) {
        $routeProvider.when("/", this._addRoute("custom"));
    }

    /**
     * Adds route.
     * @private
     * @param   {string}            viewName               View name.
     * @param   {string}            controllerName         Controller name. Optional.
     * @param   {string|string[]}   stylesheetName         Stylesheet name. Optional.
     * @return  {IRoute}            A route definition.
     */
    private _addRoute = (viewName: string, controllerName?: string, stylesheetName?: string|Array<string>): ng.route.IRoute => {
        controllerName = controllerName ? controllerName : viewName;
        stylesheetName = stylesheetName ? stylesheetName : viewName;

        var cssFile: Array<string> = this._getCSSFiles(stylesheetName);
        var controllerNameWithPrefix: string = controllerName.concat("Controller");
        var templateFile: string = this.appConfig.route.viewPath.concat(viewName, ".html");
        var controllerFile: string = this.appConfig.route.controllerPath.concat(controllerNameWithPrefix);

        var route = {
            controller: controllerNameWithPrefix,
            css: cssFile,
            resolve: this._resolve(controllerFile),
            templateUrl: templateFile
        };
        return route;
    };

    /**
     * @summary Format CSS file.
     * @param {string} stylesheetName Stylesheet name.
     */
    private _formatCssPath = (stylesheetName: string) => {
        return this.appConfig.route.cssPath.concat(stylesheetName, ".css");
    };

    /**
     * @summary Gets the CSS files.
     * @param   {string|string[]} stylesheetName Stylesheet name.
     * @return  {string[]}        CSS files.
     */
    private _getCSSFiles = (stylesheetName: string|Array<string>): Array<string> => {
        var cssFiles: Array<string> = new Array<string>();
        var cssPath: string = null;

        if (typeof stylesheetName === "string") {
            cssPath = this._formatCssPath(stylesheetName);
            cssFiles.push(cssPath);
        } else {
            for (var index in stylesheetName) {
                cssPath = this._formatCssPath(stylesheetName[index]);
                cssFiles.push(cssPath);
            }
        }

        return cssFiles;
    };

    /**
     * @summary Resolve route.
     * @private
     * @param   {string|Array<string>} viewName View name.
     * @return  {Object}               Resolve object.
     */
    private _resolve = (controllerFile: string|Array<string>): any => {
        var dependencies: Array<string> = (typeof controllerFile === "string") ? [controllerFile] : controllerFile;

        return {
            load: ["$q", "$rootScope", ($q: ng.IQService, $rootScope: ng.IRootScopeService) => {
                return this._resolveDependencies($q, $rootScope, dependencies);
            }]
        };
    };

    /**
     * @summary Resolve dependencies.
     * @private
     * @param   {IQService}         $q           Q service.
     * @param   {IRootScopeService} $rootScope   Root scope service.
     * @param   {Array<string>}     dependencies Dependencies.
     * @return  {IPromise<any>}     Promise.
     */
    private _resolveDependencies = ($q: ng.IQService, $rootScope: ng.IRootScopeService, dependencies: Array<string>): ng.IPromise<any> => {
        var defer = $q.defer();

        require(dependencies, () => {
            defer.resolve();
            $rootScope.$apply();
        });

        return defer.promise;
    };
}

export = RouteConfiguration;
