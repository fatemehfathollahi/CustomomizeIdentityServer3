﻿define(['ko', 'jquery', 'styler']
            , function (ko, $, styler) {
                styler.load("/Content/fileUpload/knockout-file-uploader.css");
                var fileBindings = {
                    customFileInputSystemOptions: {
                        wrapperClass: 'custom-file-input-wrapper',
                        fileNameClass: 'custom-file-input-file-name',
                        buttonGroupClass: 'custom-file-input-button-group',
                        buttonClass: 'custom-file-input-button',
                        clearButtonClass: 'custom-file-input-clear-button',
                        buttonTextClass: 'custom-file-input-button-text',
                    },
                    defaultOptions: {
                        wrapperClass: 'input-group',
                        fileNameClass: 'disabled form-control',
                        noFileText: 'No photos selected',
                        buttonGroupClass: 'input-group-btn',
                        buttonClass: 'btn btn-primary',
                        clearButtonClass: 'btn btn-default',
                        buttonText: 'Choose Picture',
                        changeButtonText: 'Change Picture',
                        clearButtonText: 'Delete Picture',
                        fileName: true,
                        clearButton: true,
                        onClear: function (fileData, options) {
                            if (typeof fileData.clear === 'function') {
                                fileData.clear();
                            }
                        }
                    },
                }

                function extendOptions(defaultOptions, newOptions) {
                    var options = {};
                    for (var prop in defaultOptions) {
                        options[prop] = typeof newOptions[prop] !== 'undefined' ? newOptions[prop] : defaultOptions[prop];
                    }
                    return options;
                }

                function addRemoveCssClass(element, cssClasses, type) {
                    var cssClasses = Array.isArray(cssClasses) ? cssClasses : cssClasses.split(' ');
                    cssClasses.forEach(function (cssClass) {
                        element.classList[type](cssClass);
                    });
                    return element;
                }

                function addCssClass(element, cssClasses) {
                    return addRemoveCssClass(element, cssClasses, 'add');
                }

                function removeCssClass(element, cssClasses) {
                    return addRemoveCssClass(element, cssClasses, 'remove');
                }

                function hasCssClass(element, cssClass) {
                    return element.classList.contains(cssClass);
                }

                var windowURL = window.URL || window.webkitURL;

                ko.bindingHandlers.fileInput = {
                    init: function (element, valueAccessor) {
                        element.onchange = function () {
                            var fileData = ko.utils.unwrapObservable(valueAccessor()) || {};
                            if (fileData.dataUrl) {
                                fileData.dataURL = fileData.dataUrl;
                            }
                            if (fileData.objectUrl) {
                                fileData.objectURL = fileData.objectUrl;
                            }
                            fileData.file = fileData.file || ko.observable();
                            fileData.fileArray = fileData.fileArray || ko.observableArray([]);

                            var file = this.files[0];
                            fileData.fileArray([]);
                            if (file) {
                                var fileArray = [];
                                for (var i = 0; i < this.files.length; i++) { // FileList is not an array
                                    fileArray.push(this.files[i]);
                                }
                                fileData.fileArray(fileArray); // set it once for subscriptions to work properly
                                fileData.file(file);
                            }

                            if (!fileData.clear) {
                                fileData.clear = function () {
                                    ['objectURL', 'base64String', 'binaryString', 'text', 'dataURL', 'arrayBuffer'].forEach(function (property, i) {
                                        if (fileData[property + 'Array'] && ko.isObservable(fileData[property + 'Array'])) {
                                            var values = fileData[property + 'Array'];
                                            while (values().length) {
                                                var val = values.splice(0, 1);
                                                if (property == 'objectURL') {
                                                    windowURL.revokeObjectURL(val);
                                                }
                                            }
                                        }
                                        if (fileData[property] && ko.isObservable(fileData[property])) {
                                            fileData[property](null);
                                        }
                                    });
                                    element.value = '';
                                    fileData.fileArray([]);
                                    fileData.file(null);
                                }
                            }
                            if (ko.isObservable(valueAccessor())) {
                                valueAccessor()(fileData);
                            }
                        };
                        element.onchange();

                        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                            var fileData = ko.utils.unwrapObservable(valueAccessor()) || {};
                            fileData.clear = undefined;
                        });
                    },
                    update: function (element, valueAccessor, allBindingsAccessor) {
                        var fileData = ko.utils.unwrapObservable(valueAccessor());

                        function fillData(file, index) {
                            if (fileData.objectURL && ko.isObservable(fileData.objectURL)) {
                                var newUrl = file && windowURL.createObjectURL(file);
                                if (newUrl) {
                                    var oldUrl = fileData.objectURL();
                                    if (oldUrl) {
                                        windowURL.revokeObjectURL(oldUrl);
                                    }
                                    fileData.objectURL(newUrl);
                                }
                            }

                            if (fileData.base64String && ko.isObservable(fileData.base64String)) {
                                if (!(fileData.dataURL && ko.isObservable(fileData.dataURL))) {
                                    fileData.dataURL = ko.observable(); // adding on demand
                                }
                            }
                            if (fileData.base64StringArray && ko.isObservable(fileData.base64StringArray)) {
                                if (!(fileData.dataURLArray && ko.isObservable(fileData.dataURLArray))) {
                                    fileData.dataURLArray = ko.observableArray();
                                }
                            }

                            ['binaryString', 'text', 'dataURL', 'arrayBuffer'].forEach(function (property) {
                                var method = 'readAs' + (property.substr(0, 1).toUpperCase() + property.substr(1));
                                if (property != 'dataURL' && !(fileData[property] && ko.isObservable(fileData[property]))) {
                                    return true;
                                }
                                if (!file) {
                                    return true;
                                }
                                var reader = new FileReader();
                                reader.onload = function (e) {
                                    function fillDataToProperty(result, prop) {
                                        if (index == 0 && fileData[prop] && ko.isObservable(fileData[prop])) {
                                            fileData[prop](result);
                                        }
                                        if (fileData[prop + 'Array'] && ko.isObservable(fileData[prop + 'Array'])) {
                                            if (index == 0) {
                                                fileData[prop + 'Array']([]);
                                            }
                                            fileData[prop + 'Array'].push(result);
                                        }
                                    }
                                    fillDataToProperty(e.target.result, property);
                                    if (method == 'readAsDataURL' && (fileData.base64String || fileData.base64StringArray)) {
                                        var resultParts = e.target.result.split(",");
                                        if (resultParts.length === 2) {
                                            fillDataToProperty(resultParts[1], 'base64String');
                                        }
                                    }
                                };

                                reader[method](file);
                            });
                        }
                        fileData.fileArray().forEach(function (file, index) {
                            fillData(file, index);
                        })
                    }
                };
                ko.bindingHandlers.fileDrag = {
                    update: function (element, valueAccessor, allBindingsAccessor) {
                        var fileData = ko.utils.unwrapObservable(valueAccessor()) || {};
                        if (!element.getAttribute("file-drag-injected")) {
                            addCssClass(element, 'filedrag');
                            element.ondragover = element.ondragleave = element.ondrop = function (e) {
                                e.stopPropagation();
                                e.preventDefault();
                                if (e.type == 'dragover') {
                                    addCssClass(element, 'hover');
                                }
                                else {
                                    removeCssClass(element, 'hover');
                                }
                                if (e.type == 'drop' && e.dataTransfer) {
                                    var files = e.dataTransfer.files;
                                    var file = files[0];
                                    fileData.fileArray([]);
                                    if (file) {
                                        var fileArray = [];
                                        for (var i = 0; i < files.length; i++) {
                                            fileArray.push(files[i]);
                                        }
                                        fileData.fileArray(fileArray);
                                        fileData.file(file);
                                        if (ko.isObservable(valueAccessor())) {
                                            valueAccessor()(fileData);
                                        }
                                    }
                                }
                            };

                            element.setAttribute("file-drag-injected", 1);
                        }
                    }
                };

                ko.bindingHandlers.customFileInput = {
                    init: function (element, valueAccessor, allBindingsAccessor) {
                        var options = ko.utils.unwrapObservable(valueAccessor());
                        if (options === false) {
                            return;
                        }
                        if (typeof options !== 'object') {
                            options = {};
                        }

                        var sysOpts = fileBindings.customFileInputSystemOptions;
                        var defOpts = fileBindings.defaultOptions;

                        options = extendOptions(defOpts, options);

                        var wrapper = addCssClass(document.createElement('span'), [sysOpts.wrapperClass, options.wrapperClass]);
                        var buttonGroup = addCssClass(document.createElement('span'), [sysOpts.buttonGroupClass, options.buttonGroupClass]);
                        var button = addCssClass(document.createElement('span'), sysOpts.buttonClass);
                        buttonGroup.appendChild(button);
                        wrapper.appendChild(buttonGroup);
                        element.parentNode.insertBefore(wrapper, element);
                        button.appendChild(element);

                        if (options.fileName) {
                            var fileNameInput = document.createElement('input');
                            fileNameInput.setAttribute('type', 'text');
                            fileNameInput.setAttribute('disabled', 'disabled');
                            buttonGroup.parentNode.insertBefore(addCssClass(fileNameInput, sysOpts.fileNameClass), buttonGroup);
                            if (hasCssClass(buttonGroup, 'btn-group')) {
                                addCssClass(buttonGroup, removeCssClass(buttonGroup, 'btn-group'), 'input-group-btn');
                            }
                        }
                        else {
                            if (hasCssClass(buttonGroup, 'input-group-btn')) {
                                addCssClass(buttonGroup, removeCssClass(buttonGroup, 'input-group-btn'), 'btn-group');
                            }
                        }

                        element.parentNode.insertBefore(addCssClass(document.createElement('span'), sysOpts.buttonTextClass), element);
                    },
                    update: function (element, valueAccessor, allBindingsAccessor) {
                        var options = ko.utils.unwrapObservable(valueAccessor());
                        if (options === false) {
                            return;
                        }
                        if (typeof options !== 'object') {
                            options = {};
                        }

                        var sysOpts = fileBindings.customFileInputSystemOptions;
                        var defOpts = fileBindings.defaultOptions;

                        options = extendOptions(defOpts, options);

                        var allBindings = allBindingsAccessor();
                        if (!allBindings.fileInput) {
                            return;
                        }
                        var fileData = ko.utils.unwrapObservable(allBindings.fileInput) || {};

                        var file = ko.utils.unwrapObservable(fileData.file);

                        var button = element.parentNode;
                        var buttonGroup = button.parentNode;
                        var wrapper = buttonGroup.parentNode;

                        addCssClass(button, ko.utils.unwrapObservable(options.buttonClass));
                        var buttonText = button.querySelector('.' + sysOpts.buttonTextClass);
                        buttonText.innerText = ko.utils.unwrapObservable(file ? options.changeButtonText : options.buttonText);
                        var fileNameInput = wrapper.querySelector('.' + sysOpts.fileNameClass);
                        addCssClass(fileNameInput, ko.utils.unwrapObservable(options.fileNameClass));

                        if (file && file.name) {
                            if (fileData.fileArray().length > 2) {
                                fileNameInput.value = fileData.fileArray().length + ' files';
                            }
                            else {
                                fileNameInput.value = fileData.fileArray().map(function (f) { return f.name }).join(', ');
                            }
                        }
                        else {
                            fileNameInput.value = ko.utils.unwrapObservable(options.noFileText);
                        }

                        var clearButton = buttonGroup.querySelector('.' + sysOpts.clearButtonClass);
                        if (!clearButton) {
                            clearButton = addCssClass(document.createElement('span'), sysOpts.clearButtonClass);
                            clearButton.onclick = function (e) {
                                options.onClear(fileData, options);
                            }
                            buttonGroup.appendChild(clearButton);
                        }
                        clearButton.innerText = ko.utils.unwrapObservable(options.clearButtonText);
                        addCssClass(clearButton, ko.utils.unwrapObservable(options.clearButtonClass));

                        if (file && options.clearButton && file.name) {
                        }
                        else {
                            clearButton.parentNode.removeChild(clearButton);
                        }
                    }
                };
                //ko.fileBindings = fileBindings;
                //return fileBindings;
            });