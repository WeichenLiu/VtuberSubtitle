// ==UserScript==

// @name         同传弹幕字幕显示
// @namespace    https://space.bilibili.com/13525042
// @version      0.1
// @description  匹配直播中同传man的弹幕以字幕形式显示
// @author       wetor (www.wetor.top)
// @match		 *://live.bilibili.com/*
// @run-at		 document-end
// @grant		 GM_addStyle
// @grant		 GM_setValue
// @grant		 GM_getValue
// @grant		 GM_registerMenuCommand
// @require		 http://code.jquery.com/jquery-1.7.2.min.js
// ==/UserScript==


/* 此脚本根据 “Bilibili上下弹幕变字幕” 改写，原作者信息如下
@name			Bilibili上下弹幕变字幕
@namespace		https://space.bilibili.com/68391#!/
@version		2.0
@description	用于突出显示B站的顶部弹幕与底部弹幕，使其呈现Youtube字幕的效果。适用于一些有字幕弹幕的生肉视频。
@author			剧情帝
*/

/*
字幕样式来自bilibili CC字幕
*/
(function() {
    'use strict';
    let style = GM_addStyle('');
	let $configPanel;
    let historySub = [];
    initCss();
	SetCss();
	SetTextShadow();
	CreateConfigPanel();
	GM_registerMenuCommand('Bilibili字幕样式设置', ToggleConfigPanel);



    function initCss(){
        var new_element = document.createElement("style");
        new_element.innerHTML =(
        `.bilibili-player-video-subtitle {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: visible;
            cursor: pointer;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            color: #fff;
            z-index: 12;
            pointer-events: none;
        }
        .subtitle-position {
            position: absolute;
            left: 5%;
            width: 90%;
            max-height: 83%;
            text-align: center;
        }
        .subtitle-position .subtitle-wrap {
            display: inline-block;
        }
        .subtitle-item-text {
            position: relative;
            white-space: normal;
            cursor: move;
            pointer-events: auto;
            padding: 0 8px;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
            border-radius: 2px;
            line-height: normal;
            font-family: none;
            word-wrap: break-word;
        }`);
        document.body.appendChild(new_element);
    }
    function SetCss() {
        for(var i=0;i<2;i++){
            if(style.sheet.cssRules.length > 0){
                style.sheet.deleteRule(0);
            }
        }
        let css1=`
        .subtitle-position-custom {
            ${If_Html(GM_getValue('position', 'top') == 'down', `bottom: 20px;`)}
            ${If_Html(GM_getValue('position', 'top') == 'top', `top: 20px;`)}
            font-size: ${ GM_getValue('fontsize', 'unset')};
            font-size: ${If_Html(GM_getValue('fontsize', 'unset') == 'unset', $(".bilibili-danmaku").css("font-size"))};
            ${If_Html( GM_getValue('color', 'original') !== 'original', `color: ${ GM_getValue('color', 'original')};`)}
			opacity: ${ GM_getValue('textAlpha', 0.8)} ;
        }`;
        let css2=`
        .subtitle-item-text-custom{
             ${If_Html( GM_getValue('showBackground', false), `background-color: rgba(0,0,0,0);`)}
             ${If_Html( GM_getValue('showBackground', true), `background-color: rgba(0,0,0,${ GM_getValue('backgroundAlpha', 0.75)});`)}
        }
        `;
        //console.log($('#js-player-decorator .bilibili-live-player-video-area').height() - (Number(GM_getValue('fontsize', 25))+8 ) * 3);

		//style.sheet.insertRule(css);
        style.sheet.insertRule(css1,0);
        style.sheet.insertRule(css2,1);
	}

	function If_Html(statement, html1, html2 = '') {
		return statement ? html1: html2;
	}

	function CreateConfigPanel() {
		$configPanel = $(`<div style="display: none; position: fixed;top: 10px;right: 10px;z-index: 10000;background: #fff;padding: 20px 10px;border: 3px solid #00a1d6;font-size: 18px;">
			<div style="text-align: center;">
				<b>同传字幕设置</b>
				<p style="font-size: smaller;">（正则表达式匹配）</p>
			</div>
			<div style="padding: 20px; padding-bottom:0">
				<div>
					<label>匹配规则：</label>
                    <br>
                    <input name="match" id="match-id" type="text"  value="(.*?)【(.*?)(】|$)" style="width: 170px; height: 20px; vertical-align: middle;">
                    <br>
                    <button id='btn-default' style="font-size:16px; height: 21px; vertical-align: middle;" >恢复默认</button>
                    <button id='btn-save' style="font-size:16px;height: 21px; vertical-align: middle;" >保存</button>
				</div>
                <br>
				<div>
				    <label>字幕行数：</label>
				    <input name="sub-lines" type="number" placeholder="1.0" step="1" min="1" max="5" value="3" style="width: 60px; height: 20px; vertical-align: middle;">
				</div>
				<br>
				<div>
				    <label>位置：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
				    <select name="sub-position" style="height: 30px;" >
						<option value="top">顶部</option>
						<option value="down">底部</option>
					</select>
				</div>
				<br>
				<div>
					<label>字体大小：</label>
					<select name="size" style="height: 30px;" >
						<option value="unset">原大小</option>
						<option value="18px">小</option>
						<option value="27px">中</option>
						<option value="38px">大</option>
					</select>
				</div>
				<br>
				<div>
					<label style="vertical-align: middle;">底板：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
					<input name="background" type="checkbox" style="width: 20px; height: 20px; vertical-align: middle;">
					<br>
					<label style="vertical-align: middle;">透明度：&nbsp;&nbsp;&nbsp;</label>
					<input name="background-alpha" type="number" placeholder="1.0" step="0.05" min="0" max="1" value="0.75" style="width: 60px; height: 20px; vertical-align: middle;">
				</div>
				<br>
				<div>
					<label>文字颜色：</label>
					<select name="color" style="height: 30px;">
						<option value="original">默认(白)</option>
						<option value="selected">自定义</option>
					</select>
					<div style="margin-top: 10px;display: flex;vertical-align: middle;-webkit-box-align: center;-ms-flex-align: center;align-items: center;-webkit-box-pack: start;-ms-flex-pack: start;justify-content: flex-start;" class="row-selection danmaku-color bui bui-color-picker bui-dark">
						<div class="bui-color-picker-wrap" style="width: 176px; position:relative">
							<div class="bui-color-picker-result">
								<span class="bui-color-picker-input bui bui-input" style="width: auto; flex: 1;">
									<div class="bui-input-wrap ">
										<input class="bui-input-input" type="text" value="" style="color: #000;border: 1px solid hsla(0, 0%, 0%, 0.2);">
									</div>
								</span>
								<span class="bui-color-picker-display" style="background: #FFFFFF; border: 1px solid hsla(0, 0%, 0%, 0.2);"></span>
							</div>
							<ul class="bui-color-picker-options" style=" margin-right: -10.666666666666666px;">
								<li class="bui-color-picker-option" style="background: #FE0302; margin-right: 10.666666666666666px;" data-value="#FE0302"></li>
								<li class="bui-color-picker-option" style="background: #FF7204; margin-right: 10.666666666666666px;" data-value="#FF7204"></li>
								<li class="bui-color-picker-option" style="background: #FFAA02; margin-right: 10.666666666666666px;" data-value="#FFAA02"></li>
								<li class="bui-color-picker-option" style="background: #FFD302; margin-right: 10.666666666666666px;" data-value="#FFD302"></li>
								<li class="bui-color-picker-option" style="background: #FFFF00; margin-right: 10.666666666666666px;" data-value="#FFFF00"></li>
								<li class="bui-color-picker-option" style="background: #A0EE00; margin-right: 10.666666666666666px;" data-value="#A0EE00"></li>
								<li class="bui-color-picker-option" style="background: #00CD00; margin-right: 10.666666666666666px;" data-value="#00CD00"></li>
								<li class="bui-color-picker-option" style="background: #019899; margin-right: 10.666666666666666px;" data-value="#019899"></li>
								<li class="bui-color-picker-option" style="background: #4266BE; margin-right: 10.666666666666666px;" data-value="#4266BE"></li>
								<li class="bui-color-picker-option" style="background: #89D5FF; margin-right: 10.666666666666666px;" data-value="#89D5FF"></li>
								<li class="bui-color-picker-option" style="background: #CC0273; margin-right: 10.666666666666666px;" data-value="#CC0273"></li>
								<li class="bui-color-picker-option" style="background: #222222; margin-right: 10.666666666666666px;" data-value="#222222"></li>
								<li class="bui-color-picker-option" style="background: #9B9B9B; margin-right: 10.666666666666666px;" data-value="#9B9B9B"></li>
								<li class="bui-color-picker-option bui-color-picker-option-active" style="background: #FFFFFF; margin-right: 10.666666666666666px;" data-value="#FFFFFF"></li>
							</ul>
							<div class="bui-color-picker-mask" style="display:none; position: absolute; width: 100%; height: 100%; top: 0; background-color: #0003; cursor:not-allowed"></div>
						</div>
					</div>
                    <br>
					<label style="vertical-align: middle;">透明度：&nbsp;&nbsp;&nbsp;&nbsp;</label>
					<input name="text-alpha" type="number" placeholder="1.0" step="0.05" min="0" max="1" value="0.80" style="width: 60px; height: 20px; vertical-align: middle;">
				</div>
			</div>
			<p class="close" style="position:absolute;top: 2px;right: 2px;color: #aaa;width: 20px;height: 20px;text-align: center;font-size: 15px;cursor: pointer;">✖</p>
		</div>`);

		if($(".has-stardust").length === 0){
			//旧版播放器，加入新播放器调色盘的css
			$configPanel.append(`<style type="text/css">
				.bui-input {
					display: -webkit-inline-box;
					display: -ms-inline-flexbox;
					display: inline-flex;
					position: relative;
					-webkit-box-pack: start;
					-ms-flex-pack: start;
					justify-content: flex-start;
					font-size: 0;
					height: 22px
				}
				.bui-input .bui-input-wrap {
					width: 100%;
					height: 100%;
					-webkit-box-sizing: border-box;
					box-sizing: border-box;
					position: relative
				}
				.bui-input .bui-input-input {
					border: 1px solid silver;
					border-radius: 2px;
					outline: none;
					-webkit-transition: all .3s;
					transition: all .3s;
					-webkit-transform: translateZ(0);
					transform: translateZ(0);
					padding: 4px 7px;
					resize: none;
					width: 100%;
					height: 100%;
					-webkit-box-sizing: border-box;
					box-sizing: border-box;
					font-size: 12px;
					-moz-appearance: textfield
				}
				.bui-input .bui-input-input::-webkit-inner-spin-button,.bui-input .bui-input-input::-webkit-outer-spin-button {
					-webkit-appearance: none
				}
				.bui-color-picker {
					-webkit-box-pack: start;
					-ms-flex-pack: start;
					justify-content: flex-start
				}
				.bui-color-picker.bui-dark .bui-input .bui-input-input {
					background-color: transparent;
					color: #fff;
					border: 1px solid hsla(0,0%,100%,.2)
				}
				.bui-color-picker.bui-dark .bui-color-picker-display {
					border: 1px solid hsla(0,0%,100%,.2)
				}
				.bui-color-picker.bui-dark .bui-color-picker-option[data-value="#222222"] {
					border-color: hsla(0,0%,100%,.1)
				}
				.bui-color-picker.bui-dark .bui-color-picker-option.bui-color-picker-option-active {
					border-color: #000
				}
				.bui-color-picker .bui-color-picker-result {
					margin-bottom: 6px;
					display: -webkit-box;
					display: -ms-flexbox;
					display: flex;
					vertical-align: middle
				}
				.bui-color-picker .bui-color-picker-input {
					margin-right: 6px;
					width: 98px
				}
				.bui-color-picker .bui-color-picker-display {
					display: inline-block;
					width: 50px;
					height: 22px;
					border: 1px solid rgba(0,0,0,.3);
					border-radius: 2px;
					vertical-align: middle;
					-webkit-box-sizing: border-box;
					box-sizing: border-box;
					-webkit-transition: background .2s;
					transition: background .2s;
					-webkit-transform: translateZ(0);
					transform: translateZ(0)
				}
				.bui-color-picker .bui-color-picker-options {
					padding: 0;
					margin: 0 -6px 0 0;
					list-style-type: none;
					white-space: normal;
					font-size: 0;
					line-height: 0
				}
				.bui-color-picker .bui-color-picker-option {
					width: 16px;
					height: 16px;
					border: 1px solid rgba(0,0,0,.3);
					-webkit-box-sizing: border-box;
					box-sizing: border-box;
					border-radius: 2px;
					margin-right: 6px;
					margin-bottom: 4px;
					cursor: pointer;
					display: inline-block
				}
				.bui-color-picker .bui-color-picker-option.bui-color-picker-option-active {
					-webkit-box-shadow: 0 0 1px 1px #fff;
					box-shadow: 0 0 1px 1px #fff
				}
			</style>`);
		}
        $("#btn-default", $configPanel).click(()=>{
			$('#match-id').val('(.*?)【(.*?)(】|$)');
            //console.log($('#match-id').val())
            GM_setValue('match', $('#match-id').val());
		});
        $("#btn-save", $configPanel).click(()=>{
            GM_setValue('match', $('#match-id').val());
		});
        $("input[name=match]", $configPanel).val( GM_getValue('match', '(.*?)【(.*?)(】|$)')).change(e=>{
			GM_setValue('match', e.target.value);
		});
        $("input[name=sub-lines]", $configPanel).val( GM_getValue('lines', 3)).change(e=>{
			GM_setValue('lines', e.target.value);
		});
        $("select[name=sub-position]", $configPanel).val( GM_getValue('position', 'top')).change(e=>{
			GM_setValue('position', e.target.value);
            SetCss();
		});
		$("select[name=size]", $configPanel).val( GM_getValue('fontsize', 'unset')).change(e=>{
			GM_setValue('fontsize', e.target.value);
			SetCss();
		});

		$("input[name=background]", $configPanel).prop('checked', GM_getValue('showBackground', true)).change(e=>{
			GM_setValue('showBackground', $(e.target).prop('checked'));
			SetCss();
		});
        $("input[name=background-alpha]", $configPanel).val( GM_getValue('backgroundAlpha', 0.75)).change(e=>{
            GM_setValue('backgroundAlpha', e.target.value);
            SetCss();
		});
		SetColor( GM_getValue('color', 'original'), false); //初始化颜色选框与色盘
		$("select[name=color]", $configPanel).change(e=>{
			SetColor( e.target.value);
		});
        $("input[name=text-alpha]", $configPanel).val( GM_getValue('textAlpha', 0.80)).change(e=>{
            GM_setValue('textAlpha', e.target.value);
            SetCss();
		});
		$(".bui-color-picker-option", $configPanel).click(e=>{
			SetColor( $(e.target).data('value'));
		});
		let $buiInputInput = $(".bui-input-input", $configPanel);
		$buiInputInput.on('input', e=>{
			if( /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test( $buiInputInput.val())){
				$buiInputInput.css('background-color', 'unset');
				SetColor( $buiInputInput.val());
			}
			else{
				$buiInputInput.css('background-color', 'hsla(0, 100%, 50%, 0.2)');
			}
		});

		$configPanel.click(e=>{
			e.stopPropagation();
		});
		$(".close", $configPanel).click(()=>{
			$configPanel.hide();
		});
		$('body').append( $configPanel).click(()=>{
			$configPanel.hide();
		});
	}

	function SetColor( color, setCss = true) {
		let $selectColor = $("select[name=color]", $configPanel);
		let $buiColorPickerMask = $(".bui-color-picker-mask", $configPanel);
		let $buiInputInput = $(".bui-input-input", $configPanel);
		let $buiColorPickerDisplay = $(".bui-color-picker-display", $configPanel);
		if(color === 'original'){
			$selectColor.val('original');
			$buiColorPickerMask.show();
			$buiInputInput.val( '#').css('background-color', 'unset');
			$buiColorPickerDisplay.css('background', '#fff');
			if(setCss){
				GM_setValue('color', color);
				SetCss();
			}
		}
		else if(color === 'selected'){
			$selectColor.val('selected');
			$buiColorPickerMask.hide();
		}
		else{
			$selectColor.val('selected');
			$buiColorPickerMask.hide();
			$buiInputInput.val( color);
			$buiColorPickerDisplay.css('background', color);
			if(setCss){
				GM_setValue('color', color);
				SetCss();
			}
		}
	}

	function ToggleConfigPanel() {
		if($configPanel.css('display') === 'none'){
			$configPanel.show();
		}
		else{
			$configPanel.hide();
		}
	}

	function CalLight (rgb) {
		rgb = rgb.replace('rgb(', '');
		rgb = rgb.replace(')', '');
		rgb = rgb.split(', ');
		return ((parseInt(rgb[0]) * 0.3 + parseInt(rgb[1]) * 0.6 + parseInt(rgb[2]) * 0.1) / 255);
	}

    function SetTextShadow() {
        let $videoDanmaku;
		//监测弹幕变化
		let damnuObserver = new MutationObserver( records => {
			let $currentDanmu;
			records.map( record =>{
				for (let i = record.addedNodes.length - 1; i >= 0; i--) {
					if(record.addedNodes[i].nodeName === '#text'){
						$currentDanmu = $(record.addedNodes[i].parentNode);
					}
					else{
						$currentDanmu = $(record.addedNodes[i]);
					}


                    var danmaku = $currentDanmu.attr('data-danmaku');
                    var showSub;

                    if(danmaku){
                        var tran = danmaku.match(GM_getValue('match',"(.*?)【(.*?)(】|$)"));
                        if(tran){
                            if(tran[1])
                                showSub = tran[1]+'：'+tran[2];
                            else
                                showSub = tran[2];
                        }
                    }
                    if(showSub){
                        historySub.push(showSub);
                        if(historySub.length>GM_getValue('lines',3)){
                            historySub.shift();
                        }
                        showSub='';
                        var j;
                        if(GM_getValue('position', 'top') == 'top'){
                            for(j=0;j<historySub.length;j++){
                                showSub=showSub+historySub[j];
                                if(j!=historySub.length)
                                    showSub=showSub+'<br>';

                            }
                        }else if(GM_getValue('position', 'top') == 'down'){
                            for(j=historySub.length-1;j>=0;j--){
                                showSub=showSub+historySub[j];
                                if(j!=0)
                                    showSub=showSub+'<br>';

                            }
                        }
                        $(".subtitle-item-text").html(showSub);

                    }

				}
			});
		});
        //等待弹幕图层的加载
		let damunContainerWaiter = new MutationObserver( records => {
			let $damunContainer = $('#chat-history-list');
			if($damunContainer.length > 0){ //弹幕图层加载完毕
				damunContainerWaiter.disconnect();
				damnuObserver.observe($damunContainer[0], {'childList':true, 'subtree':true});
                //var html="<div id='video-danmaku-sub'></div>";
                var html=`
                    <div class="bilibili-player-video-subtitle" style="text-shadow: none;">
                        <div class="subtitle-position subtitle-position-custom">
                            <div class="subtitle-wrap">
                                <div class="subtitle-group">
                                    <span class="subtitle-item-text subtitle-item-text-custom"  false">
                                    </span>
                                </div>
                                <div class="subtitle-group second" style="font-size: 12.2037px;"></div>
                            </div>
                        </div>
                    </div>
                    `;
                $("#js-player-decorator .bilibili-live-player-video-danmaku").html(html+$("#js-player-decorator .bilibili-live-player-video-danmaku").html());
			}
		});

		if($("#chat-history-list").length > 0){
			damunContainerWaiter.observe($("#chat-history-list")[0], {'childList':true, 'subtree':true});
		}
		else{
			//稍后再看页面一开始没有播放器，须等待
			let bofqiWaiter = new MutationObserver( records => {
				if($("#chat-history-list").length > 0){
					damunContainerWaiter.observe($("#chat-history-list")[0], {'childList':true, 'subtree':true});
					bofqiWaiter.disconnect();
				}
			});
			bofqiWaiter.observe( $("#viewlater-app .app-wrap .view-later-module")[0], {'childList':true, 'subtree':true});
		}
    }
    // Your code here...
})();
