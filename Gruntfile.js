// Grunfile which does:
 // Linting
  // SASS Compilation
  // HTTP Server with livereload
  // Karma (Cross browser testing)
  // File concatination // Todo
  // Minification // Todo


module.exports = function(grunt) {
  "use strict";
  grunt.initConfig({
    // Watch: Kick off build workflow whenever project files change.
    watch: {
      options: {
        // Create a livereload server. See: http://livereload.com/extensions/
        livereload: true
      },
      // The more specific, the more performant.
      files: ['site/**/*.html', 'site/**/*.js', 'site/**/*.css', 'Gruntfile.js', '!site/bower_components/**'],
      // Watch Sass compilation.
      css: {
        files: ['site/**/*.scss', '!site/bower_components/**'],
        tasks: ['newer:sass'], // Only compile updated files each time.
        // tasks: ['sass'], // Alt option: Compile all files each time.
        options: {
          // Significantly faster, docs say possibly less stable.
          spawn: false
        }
      },
      // Watch Jshint.
      js: {
        files: ['Gruntfile.js', 'site/**/*.js', '!site/bower_components/**'],
        tasks: ['jshint'], // Lint all files each time.
        // tasks: ['newer:jshint'], // Alt option: Only lint updated files each time.
        options: {
          // Significantly faster, docs say possibly less stable.
          spawn: false
        }
      },
      //Watch karma: run unit tests with karma (server needs to be already running)
      karma: {
        files: ['site/**/*.js'], // These are the watch files, not the karma files (see karma.conf.js).
        tasks: ['karma:unit:run'],
        options: {
          // Significantly faster, docs say possibly less stable.
          spawn: false
        }
      },
    },
    // Jshint: default linting of javascripts.
    jshint: {
      files: {
        src: ['Gruntfile.js', 'site/**/*.js', '!site/bower_components/**']
      },
      options: browserLintOptions(),
    },
    // SASS: compile in place: *.scss -> *.css
    sass: {
      options: {
        noCache: true,
        sourcemap: 'none'
      },
      dist: {
        files: [{
            expand: true,
            src: 'site/**/*.scss',
            ext: '.css'
        }]
      }
    },
    // Karma
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true,
        singleRun: false
      }
    },
    // Connect: Http server on port 8000.
    connect: {
      server: {
        options : {
          base: 'site'
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-newer');
  grunt.registerTask('default', 'watch', function(){
    var tasks = ['connect','karma','watch'];
    // So that if e.g. linting fails, tests still run, and live reload happens.
    grunt.option('force', true);
    grunt.task.run(tasks);
  });


  // See http://jshint.com/docs/options/
  function globalLintOptions() {
    return {
      // Source: letscodejavascript.com Lab #1
      bitwise: true,
      curly: false,
      eqeqeq: true,
      forin: true,
      immed: true,
      latedef: false,
      newcap: true,
      noarg: true,
      noempty: true,
      nonew: true,
      regexp: true,
      undef: true,
      strict: true,
      trailing: true,
      // Angular Options:
      "jasmine": true,
      globals: {
        "angular" : false,
        "module" : false,
        "inject" : false,
      }
    };
  }

  function browserLintOptions(){
    var options = globalLintOptions();
    options.browser = true;
    return options;
  }
};
