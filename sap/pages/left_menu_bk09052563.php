                    <div class="sb-sidenav-menu">
                        <div class="nav">
                            <div class="sb-sidenav-menu-heading"><i class="fas fa-user"></i> &nbsp; USER</div>
                            <a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"
                                ><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                                Work Scheduling</a>
                            <a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=backlog"
                                ><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                                BackLog Report</a>    
                            <a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=line_calendar"
                                ><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                                Line Scheduling</a>
                           

                            <div class="sb-sidenav-menu-heading"><i class="fas fa-user-secret"></i> &nbsp; ADMIN</div>
                            <a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"
                                ><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                                Work Scheduling</a>
                            <a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=backlog"
                                ><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                                BackLog Report</a> 
                            <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=workorder"
                                ><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                                Work Order</a>    
                            <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_confirmation"
                                ><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                                Confirmation</a> 
                                
                            <!----------    for admin --------->    
                            <div class="sb-sidenav-menu-heading"><i class="fas fa-tasks"></i> &nbsp; Main Menu</div>
                            <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseLayouts" aria-expanded="false" aria-controls="collapseLayouts"
                                ><div class="sb-nav-link-icon"><i class="fas fa-columns"></i></div>
								Import Data SAP
                                <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
                            <div class="collapse" id="collapseLayouts" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
                                <nav class="sb-sidenav-menu-nested nav">
								 <!--<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"></i>&nbsp;Scheduling</a> -->
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_iw37n"></i>&nbsp;IW37N</a>
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_tasklist"></i>&nbsp;PM Task List</a>
                                    <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_lineschdul"></i>&nbsp;Line Scheduling</a>
                                    <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_manhour"></i>&nbsp;Man Hour</a>
                                    <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_equipment"></i>&nbsp;Equipment</a>
                                    <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_functional"></i>&nbsp;Functional</a>									
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_lineproduct"></i>&nbsp;Line Product</a>
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_zone"></i>&nbsp;Zone</a>
                                    <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_machine"></i>&nbsp;Machine</a>
                                    <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_activitytype"></i>&nbsp;Activity Type</a>									
								</nav>
                            </div>

                            <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#configsystem" aria-expanded="false" aria-controls="collapseLayouts"
                                ><div class="sb-nav-link-icon"><i class="fas fa-columns"></i></div>
								Config System
                                <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
                            <div class="collapse" id="configsystem" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
                                <nav class="sb-sidenav-menu-nested nav">
								 <!--<a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=calendar"></i>&nbsp;Scheduling</a> -->
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_reason"></i>&nbsp;Reason</a>
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_workstatus"></i>&nbsp;Work Status</a>
                                    <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_worktype"></i>&nbsp;Work Type</a>   
                                    <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_zb"></i>&nbsp;Activity(ZB)</a>                                                                  								
								</nav>
                            </div>
                            
							

                            <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#settingUser" aria-expanded="false" aria-controls="settingUser"
                                ><div class="sb-nav-link-icon"><i class="fa fa-users"></i></div>
								Personel
                                <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
                            <div class="collapse" id="settingUser" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
                                <nav class="sb-sidenav-menu-nested nav">
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_personel">Personal</a>
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_level">Lavel</a>
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_department">Department</a>
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_position">Position</a>		
                                    <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=M_Group">Group</a>						
								</nav>
                            </div>

                            <!----------    for admin --------->    


                             <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#report" aria-expanded="false" aria-controls="report"
                                ><div class="sb-nav-link-icon"><i class="fas fa-book-open"></i></div>
								Report
                                <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
                            <div class="collapse" id="report" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
                                <nav class="sb-sidenav-menu-nested nav">
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_backlog">Back log Report</a>
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_pm">PM Completion</a>
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_peatime">Peatime Completion</a>
									<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_technician">Technician Utilitization</a>
								</nav>
                            </div>

                           <!-- <a class="nav-link" href="<?php $PHP_SELF ?>index.php?module=tb_confirm"
                                ><div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                                Confirm</a> -->
							<!-- Setting -->



							<?php
							if ($_SESSION['username']==""){
							?>
								<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=login"
                                ><div class="sb-nav-link-icon"><i class="fas fa-lock"></i></div>เข้าสู่ระบบ</a>
							<?php }else{?>
								<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=logout"
                                ><div class="sb-nav-link-icon"><i class="fas fa-unlock"></i></div>ออกระบบ</a>
							<?php }?>


<!-- 
                            <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapsePages" aria-expanded="false" aria-controls="collapsePages"
                                ><div class="sb-nav-link-icon"><i class="fas fa-book-open"></i></div>
								รายงาน
                                <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
                            <div class="collapse" id="collapsePages" aria-labelledby="headingTwo" data-parent="#sidenavAccordion">
                                <nav class="sb-sidenav-menu-nested nav accordion" id="sidenavAccordionPages">
                                    <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#pagesCollapseAuth" aria-expanded="false" aria-controls="pagesCollapseAuth"
                                        >Report
                                        <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
                                    <div class="collapse" id="pagesCollapseAuth" aria-labelledby="headingOne" data-parent="#sidenavAccordionPages">
                                        <nav class="sb-sidenav-menu-nested nav">
										<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_backlog">Back log Report</a>
										<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_pm">PM Completion</a>
										<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_peatime">Peatime Completion</a>
										<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=report_technician">Technician Utilitization</a>
										</nav>
                                    </div>
                                    <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#pagesCollapseError" aria-expanded="false" aria-controls="pagesCollapseError"
                                        >Cost , **
                                        <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div
                                    ></a>
                                    <div class="collapse" id="pagesCollapseError" aria-labelledby="headingOne" data-parent="#sidenavAccordionPages">
                                        <nav class="sb-sidenav-menu-nested nav"><a class="nav-link" href="401.html">401 Page</a><a class="nav-link" href="404.html">404 Page</a><a class="nav-link" href="500.html">500 Page</a></nav>
                                    </div>
                                </nav>
                            </div>

                            <div class="sb-sidenav-menu-heading">Addons</div>
                            <a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=charts"
                                ><div class="sb-nav-link-icon"><i class="fas fa-chart-area"></i></div>
                                Charts</a>
								<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=tables"
                                ><div class="sb-nav-link-icon"><i class="fas fa-table"></i></div>
                                Tables</a>
								<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=blankpage"
                                ><div class="sb-nav-link-icon"><i class="fas fa-table"></i></div>
                                Blank Page</a>

 -->

                        </div>
                    </div>

                    <div class="sb-sidenav-footer">
                        <div class="small">Logged in as:</div>
                        <?php echo $_SESSION['sysstatus'];?>
                    </div>