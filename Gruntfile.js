/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

module.exports = function(grunt) {
    
    // Project configuration.

    grunt.initConfig({


        // CONSTANTS
        // ---------------------------------------------------------------------
        src_files: [
            'src/initialize.js',
            'src/utilities/domData.js',
            'src/utilities/domTraversal.js',
            'src/transclusion.js',
            'src/preProcessNode.js',
            'src/bindingHandlers.js'
            //'src/exports.js'
        ],

        spec_files: ['test/**/*.spec.js'],

        pkg: grunt.file.readJSON('package.json'),

        jasmine: {
            dev: {
                src: [
                    'lib/jquery.min.js',
                    'funky.js',
                    '2048/2048-game.js',
                    '2048/2048-ai.js',
                    '2048/2048-app.js'
                ],
                options: {
                    specs: ['<%= spec_files %>']
                }
            }
        },


        // DEV OPS
        // ---------------------------------------------------------------------
        watch: {
            files: ['<%= src_files %>'],
            tasks: ['jasmine']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');


    // Default task.
    grunt.registerTask('default', ['watch']);

};
