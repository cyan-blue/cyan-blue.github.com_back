({
    init: function() {
        var self = this;
        self.time = 1;

        self.initLeftMenu(self.bindLeftEvent);
        if (category) {
        self.bindRightMenu();
        };
        self.search();
        self.bindScrollShow();
    },
    initLeftMenu: function(callback) {
        var self = this;
        $.getJSON("../../../../category.json", function(data) {
            $.each(data, function(index, val) {
                var date = Date.parse(val.date);
                var tag = '';
                for (var i = val.tags.length - 1; i >= 0; i--) {
                    tag += '<span class="node">' + val.tags[i] + '</span>'
                };
                var string = '<li class="menu-li"><span class="time">' + self.format(date) + '</span><div class="content"><a class="title" href="/' + val.link + '">' + val.title + '</a><div class="tags"><span>' + tag + '</span></div></div></li>';
                $('.ul-div ul').append(string);
            });

            callback.call(self);


        });
    },
    bindLeftEvent: function() {
        var self = this;
        var toggleBlog = function() {
            var localhref=window.location.href;
            localhref=localhref.match(/index.html$/)?localhref:localhref+"index.html";
            var blogList = $(".menu-li");
            var blogTop = 0,
                num = 0;
            for (var i = 0; i < blogList.length; i++) {
                console.log(localhref+" "+blogList.eq(i).find('a').attr('href'))
                if (encodeURI(decodeURI(localhref)).indexOf(encodeURI(blogList.eq(i).find('a').attr('href'))) >= 0) {
                    blogTop = blogList.eq(i).offset().top - document.body.scrollTop;
                    num = i;
                    console.log(i);
                    break;
                }
            };
            return {
                getTop: function() {
                    return blogTop;
                },
                getNum: function() {
                    return num;
                }
            };
        };
        $('.menu-li').eq(toggleBlog().getNum()).addClass('active');
        $("#toggle").click(
            function(event) {
                event.preventDefault();
                $(this).find(".top").toggleClass("active");
                $(this).find(".middle").toggleClass("active");
                $(this).find(".bottom").toggleClass("active");
                $(".main-content").toggleClass("active");
                $("#overlay").toggleClass("open");
                $(".right-menu").toggleClass("active");
                $('.ul-div').scrollTop(0);
                if (self.time == 1) {
                    $('.ul-div').animate({
                        scrollTop: toggleBlog().getTop()
                    }, 500);
                    self.time += 1;
                }
            }
        );

        $(".main-content").click(function() {
            if ($(".main-content").attr("class").split(" ").length == 2) {
                $("#toggle").trigger("click");
            };
        });
        var scroll = function(event, scroller) {
            var k = event.wheelDelta ? event.wheelDelta : -event.detail * 10;
            scroller.scrollTop = scroller.scrollTop - k;
            return false;
        };
        $('.ul-div').perfectScrollbar();
        $('.menu-li').mouseenter(function(e) {
            var target = $(e.delegateTarget);
            setTimeout(function() {
                if (target.is(':hover')) {
                    target.find('div.tags').animate({
                        'margin-top': '5px'
                    }, 400);
                }
            }, 500);
        }).mouseleave(function(e) {
            $(e.delegateTarget).find('div.tags').animate({
                'margin-top': '-25px'
            }, 200);
        });
        $('.title').on('click', function() {
            history.pushState('', '', $(this).attr('href'));
            $.ajax({
                url: $(this).attr('href'),
                success: function(res) {
                    $('.ul-div ul').empty();
                    $('.right-menu-ul').empty();
                    $('.main-content .row').html($(res).find('.row').html());
                    $(document).scrollTop(0);
                    $('#toggle').off('click');
                    $(".main-content").off('click');
                    $('.tagnode').off('click');
                    $('.search').off('keyup');
                    self.time = 1;
                    $('#init').remove();
                    $('body').append($(res).filter('#init'));
                    self.initLeftMenu(self.bindLeftEvent);
                    if (category) {$('.right-menu').addClass('active');  console.log(123); self.bindRightMenu();}
                    self.search();
                }
            })

            return false;
        });

    },
    bindRightMenu: function() {
        var getEle = $('.content').find('h2,h3');
        var a = getEle.length;
        for (var i = 0; i < a;) {
            var tag = "tag" + i;
            getEle.eq(i).addClass(tag);
            getEle.eq(i).attr('id', tag);
            var temp = '<li ><a class="a' + i + '" href="#tag' + i + '">' + getEle.eq(i).html() + '</a>   <ul class="nav">';
            i = i + 1;
            while ((i < a) && (getEle.eq(i).is('h3'))) {
                var tag = "tag" + i;
                getEle.eq(i).addClass(tag);
                getEle.eq(i).attr('id', tag);
                temp += '<li> <a class = "a' + i + ' sub" href = "#tag' + i + '" > ' + getEle.eq(i).html() + ' </a> </li>';
                i++;
            }
            temp += '</ul></li>';
            $(".right-menu-ul").append(temp);
        };

        $('.content').find('h2,h3,article').each(function() {
            new Waypoint({
                element: this,
                handler: function(direction) {
                    var num = '.a' + $(this.element).attr("class").charAt(3);
                    $('.right-menu-ul a').removeClass('active');
                    $('.right-menu-ul ul').removeClass('active');
                    $('.right-menu-ul li ul li').removeClass('active');
                    if ($(num).hasClass("sub")) {
                        $(num).parent().parent().addClass("active");
                        $(num).parent().parent().siblings("a").addClass('active');
                    }
                    $(num).addClass("active");
                    $(num).siblings("ul").addClass("active");

                },
                continuous: false
            });
        });
        var rightTop = parseInt($('.right-menu').offset().top);
        $(document).scroll(function(e) {
            var pos = document.body.scrollTop;
            if (pos >= rightTop) {
                $('.right-menu').addClass('fixed');
            } else {
                $('.right-menu').removeClass('fixed');
                $('.right-menu-ul a').removeClass('active');
                $('.right-menu-ul ul').removeClass('active');
                $('.right-menu-ul li ul li').removeClass('active');
            }
        });
    },
    search: function() {

        var input = $('.search');
        input.bind('keyup', sendKeyWord);

        function sendKeyWord(e) {
            dealData($.trim(input.val()));
        };

        function dealData(text) {
          var totalList = $(".menu-li");
            for (var i = 0; i < totalList.length; i++) {
                if (totalList.eq(i).text().toLowerCase().indexOf(text.toLowerCase()) < 0) {
                    totalList.eq(i).hide();
                } else {
                    totalList.eq(i).show();
                }
            }
            $('.ul-div').animate({
                scrollTop: 0
            }, 500);
        };

        $('.tagnode').on('click', searchNode);

        function searchNode(e) {
            if ($(".main-content").attr("class").split(" ").length == 1) {
                $("#toggle").trigger("click");
            };
            e.stopPropagation();
            $('.search').val($(e.target).html());
            dealData($(e.target).html());
        };
    },
    bindScrollShow: function() {
        var isUp = true;
        var lastScrollTop = 0;
        var searchDiv = $('.search-div')
        var topThreshold = searchDiv.height();
        $('.ul-div').scroll(function(e) {
            var top = parseInt($('.ps-scrollbar-y').css('top'));
            if (top == lastScrollTop) return;
            if (top < topThreshold) {
                searchDiv.fadeIn();
                return;
            }
            if (isUp ^ (top < lastScrollTop)) {
                isUp = !isUp;
                searchDiv.fadeToggle();
            }
            lastScrollTop = top;
        });
    },
    format: function(date) {
        var seconds = parseInt((Date.now() - date) / 1000);
        if (seconds < 60) return parseInt(seconds / 60) + ' secs ago';
        if (seconds / 60 < 60) return parseInt(seconds / 60) + ' mins ago';
        if (seconds / 3600 < 24) return parseInt(seconds / 3600) + ' hrs ago';
        if (seconds / (3600 * 24) < 30) return parseInt(seconds / (3600 * 24)) + ' days ago';
        return date.toString('MMM d yyyy');
    }
}).init();
