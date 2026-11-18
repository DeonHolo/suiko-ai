import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    'ai-review-server-regression-suite': {
                        table: 'sys_atf_test_suite'
                        id: '47a536e4837d4aee8793a15628adeffd'
                    }
                    'ai16-review-persistence-step': {
                        table: 'sys_atf_step'
                        id: '496fe3120915413797d169dd7d12e29f'
                    }
                    'ai16-review-persistence-test': {
                        table: 'sys_atf_test'
                        id: 'bc1ff42900414effb460ce548213baf3'
                    }
                    'ai18-approved-rule-test': {
                        table: 'sys_atf_test'
                        id: 'af3df7b4fe8d4bea80920398d3d87b79'
                    }
                    'ai18-editor-step': {
                        table: 'sys_atf_step'
                        id: '634e46f9335d4661b18ba51e9038e5d0'
                    }
                    'ai18-editor-user': {
                        table: 'sys_atf_step'
                        id: '5b05a09e6e7e484292ab8a03212e066b'
                    }
                    'ai18-manager-step': {
                        table: 'sys_atf_step'
                        id: 'dad2f839ba42417aba6f1b8840993d67'
                    }
                    'ai18-manager-user': {
                        table: 'sys_atf_step'
                        id: 'fafcd4455d6e45809b4c47178c719ba5'
                    }
                    'ai19-policy-step': {
                        table: 'sys_atf_step'
                        id: 'bbc9c869f7c44830b275738f335ec84d'
                    }
                    'ai21-claim-step': {
                        table: 'sys_atf_step'
                        id: 'a8edb3b62f394be3b4775358f6047c8b'
                    }
                    'ai22-revision-step': {
                        table: 'sys_atf_step'
                        id: '5fc233390b6c42b189e729e4c4aa24a6'
                    }
                    'ajv@8.20.0/dist/runtime/ucs2length.js': {
                        table: 'sys_module'
                        id: 'd77602b3ed7a43abbacc3eaf7ef7a277'
                        deleted: true
                    }
                    'ajv@8.20.0/package.json': {
                        table: 'sys_module'
                        id: 'd76de6a35f8641de94b755667db607a3'
                        deleted: true
                    }
                    'be02-assigned-legal-user': {
                        table: 'sys_atf_step'
                        id: '677c43527dd44fb6bf779d1833bc786c'
                    }
                    'be02-check-changes-requested': {
                        table: 'sys_atf_step'
                        id: 'f3c2fb510f584c058bd2aae227595257'
                    }
                    'be02-check-current-status': {
                        table: 'sys_atf_step'
                        id: '49834f4b8f8d49979f8a5b43166970d8'
                    }
                    'be02-check-fresh-routing': {
                        table: 'sys_atf_step'
                        id: 'a4629dd519dc427e8d24767579635c42'
                    }
                    'be02-check-older-clearance': {
                        table: 'sys_atf_step'
                        id: '2f223d5e008a473baf352fe7e953a2ab'
                    }
                    'be02-check-outsider': {
                        table: 'sys_atf_step'
                        id: '015d524c077a49c9be04a837446f2ea6'
                    }
                    'be02-check-unassigned': {
                        table: 'sys_atf_step'
                        id: '16d89eadfd87475db523e06677aa6fc8'
                    }
                    'be02-final-editor-check': {
                        table: 'sys_atf_step'
                        id: '4aa86055687045319023d3a1a297463c'
                    }
                    'be02-inactive-legal-user': {
                        table: 'sys_atf_step'
                        id: 'ecdb1b53f52c4721b6463926d78fea40'
                    }
                    'be02-legal-outsider': {
                        table: 'sys_atf_step'
                        id: '2badd1a4f8b44cd5a80dc89b6cd5ec2b'
                    }
                    'be02-legal-workflow-step': {
                        table: 'sys_atf_step'
                        id: '48a7fca4b1f346548893cc2dde07a321'
                    }
                    'be02-legal-workflow-test': {
                        table: 'sys_atf_test'
                        id: '72c490995ac04698a726dcd67ccb54bb'
                    }
                    'be02-legal-workflow-user': {
                        table: 'sys_atf_step'
                        id: '065a5c18dfae4fd8a204dd8ff503d27b'
                    }
                    'be02-return-to-editor': {
                        table: 'sys_atf_step'
                        id: '0589ac4d798444f3bd7e7c8a81172849'
                    }
                    'be02-review-newer-copy': {
                        table: 'sys_atf_step'
                        id: 'd4e25587d7d84782b828c9d87e3a088c'
                    }
                    'be02-test-as-outsider': {
                        table: 'sys_atf_step'
                        id: 'fc7a36aa6af64ee7b868cb15381c3d57'
                    }
                    'be02-test-as-reviewer': {
                        table: 'sys_atf_step'
                        id: 'a3f47f147e294bcc839f81d46a278556'
                    }
                    'be02-test-as-unassigned': {
                        table: 'sys_atf_step'
                        id: 'fff3724f0940410899232e79d30335d6'
                    }
                    'be02-unassigned-legal-user': {
                        table: 'sys_atf_step'
                        id: 'bf7c90ed4c0248318c78a162f7d5c43f'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: '2b56dd9171ea4623ae91d4506313e30c'
                    }
                    'diff@9.0.0/index.js': {
                        table: 'sys_module'
                        id: '80b5e6021f7d459a8c86d0cccaeacc11'
                        deleted: false
                    }
                    'diff@9.0.0/package.json': {
                        table: 'sys_module'
                        id: '7f6958deaccc4422bbcc9fcff113fb44'
                        deleted: false
                    }
                    'fe02-archive-admin-step': {
                        table: 'sys_atf_step'
                        id: '495b61f6e3794d1580467e3bed3fd2c5'
                    }
                    'fe02-archive-admin-user': {
                        table: 'sys_atf_step'
                        id: '4b4424d701c8421fb8368c4b6b43e847'
                        deleted: true
                    }
                    'fe02-archive-editor-user': {
                        table: 'sys_atf_step'
                        id: '420e9ed5b97b487881f370ff8d62693d'
                    }
                    'fe02-archive-guard-test': {
                        table: 'sys_atf_test'
                        id: '7b400f128093414981ce5012abf21b96'
                    }
                    'fe02-archive-outsider-step': {
                        table: 'sys_atf_step'
                        id: '7a8a87187fdd4b1e91cd8162e58333a2'
                    }
                    'fe02-archive-outsider-user': {
                        table: 'sys_atf_step'
                        id: 'dc395843a1a14be5971fa3c0f6859477'
                    }
                    'fe02-archive-rule-step': {
                        table: 'sys_atf_step'
                        id: '414b542c07a94dfeb5b9e47d2691258f'
                    }
                    'fe02-archive-rules-user': {
                        table: 'sys_atf_step'
                        id: 'c84c5f3d36be4f129ed2fbe49e9090b1'
                    }
                    'fe02-archive-story-step': {
                        table: 'sys_atf_step'
                        id: '8fd30db97ed6492eb4f616a659e9645a'
                    }
                    'jsonc-parser@3.3.1/index.js': {
                        table: 'sys_module'
                        id: '5b7a401956b74c05a95a6bbdb11774e9'
                        deleted: false
                    }
                    'jsonc-parser@3.3.1/package.json': {
                        table: 'sys_module'
                        id: '5913dee7fb954d4ba81b46fd7465c97a'
                        deleted: false
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '4b029030497f4938b7668d5af419e7c2'
                        deleted: false
                    }
                    'policy-version-create': {
                        table: 'sys_security_acl'
                        id: '42f8a819bca54b9b825e261e66b6b822'
                    }
                    'policy-version-delete': {
                        table: 'sys_security_acl'
                        id: '9c63ea80b8384b60b29e77aa3280512c'
                    }
                    'policy-version-read': {
                        table: 'sys_security_acl'
                        id: '45793d8bb4bf4cd08fbe2b9a7ce8839b'
                    }
                    'policy-version-write': {
                        table: 'sys_security_acl'
                        id: '0f84e0da476447659961acc381cbf3f7'
                    }
                    'rule-version-create': {
                        table: 'sys_security_acl'
                        id: '1107aa35ffb74eb9bc36a9f35d981800'
                    }
                    'rule-version-delete': {
                        table: 'sys_security_acl'
                        id: '0740c2d768054b7c91123c86973f130a'
                    }
                    'rule-version-read': {
                        table: 'sys_security_acl'
                        id: '20963560e7464e71ab6472bd498c6f08'
                    }
                    'rule-version-write': {
                        table: 'sys_security_acl'
                        id: '2a156e3011d24ff6a855adca50467973'
                    }
                    src_server_archive_ts: {
                        table: 'sys_module'
                        id: '58acdc10d27241819f11149f0bcaf09b'
                    }
                    'src_server_archive-test_ts': {
                        table: 'sys_module'
                        id: '92327bf7a1784360b5d80d431e24c3c2'
                    }
                    'src_server_decision-check_ts': {
                        table: 'sys_module'
                        id: '7db7d989f95f4c719ab535578f5fb7c9'
                    }
                    'src_server_editorial-rules_ts': {
                        table: 'sys_module'
                        id: '4fca46b2d69f4572a0b3963e3f102d5a'
                    }
                    'src_server_editorial-rules-test_ts': {
                        table: 'sys_module'
                        id: 'b62aa9f6feca4957a898b917089d13a0'
                    }
                    'src_server_generated_assessment-checks_js': {
                        table: 'sys_module'
                        id: 'd5e299dbf92e4db188a4a06ceae6f399'
                    }
                    'src_server_generated_claim-evidence_js': {
                        table: 'sys_module'
                        id: 'a43a6818970f4646afc1d38c502e514a'
                    }
                    'src_server_generated_decision-review_js': {
                        table: 'sys_module'
                        id: '52af82ec7249464f82e231e3d15e6f84'
                    }
                    'src_server_generated_editorial-rules_js': {
                        table: 'sys_module'
                        id: '40d99bb5161b4f4e8c9b1088fff92b74'
                    }
                    'src_server_generated_policy-proposals_js': {
                        table: 'sys_module'
                        id: '0841df65dd574f91a39dd51ce5315489'
                    }
                    'src_server_generated_provider-json_js': {
                        table: 'sys_module'
                        id: '36f6f2df55eb49a8841a8035a8f8200d'
                    }
                    'src_server_generated_review-attempt_js': {
                        table: 'sys_module'
                        id: '901dc8681de54238b2bc753d5571a356'
                    }
                    'src_server_generated_review-data_js': {
                        table: 'sys_module'
                        id: '808a3fec8dd947a68b7ef6e8bc17c63a'
                    }
                    'src_server_generated_revision-diff_js': {
                        table: 'sys_module'
                        id: 'c37b4ef4328944178dbccbb9c4bddba5'
                    }
                    'src_server_generated_source-reader_js': {
                        table: 'sys_module'
                        id: 'c1837ca8406645fdb3dc907321c45024'
                    }
                    'src_server_generated_story-input_js': {
                        table: 'sys_module'
                        id: '24c00b69d3274fb9ad7e2f90fa67e083'
                    }
                    src_server_generated_validators_js: {
                        table: 'sys_module'
                        id: 'fdfa80ae7e8447e483ba279e7ff307ed'
                    }
                    'src_server_generated_workbench-review_js': {
                        table: 'sys_module'
                        id: 'af425b11a8684d52a856ad9307581b27'
                    }
                    'src_server_legal-workflow-test_ts': {
                        table: 'sys_module'
                        id: '6580c32b75fc44129f1c7d39905af622'
                    }
                    'src_server_policy-records_ts': {
                        table: 'sys_module'
                        id: 'd54e3130f3db4c9f92c877eaa39b1071'
                    }
                    'src_server_read-sources_ts': {
                        table: 'sys_module'
                        id: '2ebc8a6006ac407c9d16edcf654f8771'
                    }
                    'src_server_review-persistence-test_ts': {
                        table: 'sys_module'
                        id: '299f3408d2f74d019f84797e40284c6a'
                    }
                    'src_server_revision-comparison-test_ts': {
                        table: 'sys_module'
                        id: '354ede403b684644bf0ebadcc5fc04bc'
                    }
                    'src_server_rule-access_ts': {
                        table: 'sys_module'
                        id: '4a3785f085484635b49cab22727160f4'
                    }
                    src_server_workbench_ts: {
                        table: 'sys_module'
                        id: '2054332e75aa416a84e82fccf31dbbc7'
                    }
                    'src_server_workbench-error_ts': {
                        table: 'sys_module'
                        id: '4eb77c30b66d478da1de7abeda874fe4'
                    }
                    'suiko-api-access': {
                        table: 'sys_security_acl'
                        id: 'ad7efc360ac94b8cbd160b45295cfc40'
                    }
                    'suiko-api-v1': {
                        table: 'sys_ws_version'
                        id: '7a2b4e77e34b4e06a58f07dcb9fe249e'
                    }
                    'suiko-approve-rule': {
                        table: 'sys_ws_operation'
                        id: '75195d7e45934cb2b84a108cd5be622e'
                    }
                    'suiko-get-archive': {
                        table: 'sys_ws_operation'
                        id: '82e5973024e149b6b7f8c8ea5a4f78b8'
                    }
                    'suiko-legal-api': {
                        table: 'sys_ws_definition'
                        id: 'fd65b63001964bf4930b37a64800c100'
                    }
                    'suiko-legal-api-access': {
                        table: 'sys_security_acl'
                        id: '4cb214ff8ffa44a28355f41390ba4f7b'
                    }
                    'suiko-legal-api-v1': {
                        table: 'sys_ws_version'
                        id: 'af3e8d0016ab4450862d91bce6613034'
                    }
                    'suiko-legal-decision': {
                        table: 'sys_ws_operation'
                        id: 'f80ea82e69f047a8a73fb0e4d58bb1bf'
                    }
                    'suiko-legal-tasks': {
                        table: 'sys_ws_operation'
                        id: '50a4b4a52149434fba19868cdae8bdca'
                    }
                    'suiko-list-policies': {
                        table: 'sys_ws_operation'
                        id: 'f8db95445431407bb22bff31853c1c48'
                    }
                    'suiko-menu': {
                        table: 'sys_app_application'
                        id: 'ec4c5be81c664df987021d8afb0e82c0'
                    }
                    'suiko-post-archive': {
                        table: 'sys_ws_operation'
                        id: '44e1a87284ac4b5592d9dfd8f4d0bc1f'
                    }
                    'suiko-provider-configuration': {
                        table: 'sys_ws_operation'
                        id: '308496b68f7945199bbfd17f7225543e'
                    }
                    'suiko-review-module': {
                        table: 'sys_app_module'
                        id: '179d0f8adbf2487f8bc538e86792185f'
                    }
                    'suiko-rule-active': {
                        table: 'sys_ws_operation'
                        id: 'a4930a5c69c6459890039f27a7eaad01'
                    }
                    'suiko-run-review': {
                        table: 'sys_ws_operation'
                        id: 'd22db22b02ea44ce9e97e0855cc2e497'
                    }
                    'suiko-save-metadata': {
                        table: 'sys_ws_operation'
                        id: 'd3916f5e92434c5ea0e001e5e1f0a871'
                    }
                    'suiko-save-policy': {
                        table: 'sys_ws_operation'
                        id: '1fe6382872d246308a23c0b7939487e4'
                    }
                    'suiko-save-revision': {
                        table: 'sys_ws_operation'
                        id: '62d32af65dd54eaca6aa649a905a0c53'
                    }
                    'suiko-save-rule': {
                        table: 'sys_ws_operation'
                        id: '0f8f739a9ee44eb4852fea1008e86f1d'
                    }
                    'suiko-state': {
                        table: 'sys_ws_operation'
                        id: '47f6ab35e47246e584e85d7eee076711'
                    }
                    'suiko-suggest-policy': {
                        table: 'sys_ws_operation'
                        id: '6a1a1bd7ee664373b9d91496860e79d6'
                    }
                    'suiko-workbench-api': {
                        table: 'sys_ws_definition'
                        id: 'd23d81dc2bee4bd498f7a14dfec6ad3f'
                    }
                    'suiko-workflow-action': {
                        table: 'sys_ws_operation'
                        id: '89abb2b5b6c1402caf85a3ddfce0fc57'
                    }
                    'x_2236136_suiko_ai_config-create': {
                        table: 'sys_security_acl'
                        id: '7e5ccb6766c04d6ab73cd0d769c70dfa'
                    }
                    'x_2236136_suiko_ai_config-delete': {
                        table: 'sys_security_acl'
                        id: '0dfb37cdc838416babab7cc87e40eb6c'
                    }
                    'x_2236136_suiko_ai_config-read': {
                        table: 'sys_security_acl'
                        id: '8012248e3a384fd0aa77427bd9d832fc'
                    }
                    'x_2236136_suiko_ai_config-write': {
                        table: 'sys_security_acl'
                        id: '31a7cfd9003d4f23812e466afbb05eb1'
                    }
                    'x_2236136_suiko_ai_legal_task-create': {
                        table: 'sys_security_acl'
                        id: '357cb95843ec468ab844c472bbd8982a'
                    }
                    'x_2236136_suiko_ai_legal_task-delete': {
                        table: 'sys_security_acl'
                        id: 'e1a7ca41408746df8e81f096760991f0'
                    }
                    'x_2236136_suiko_ai_legal_task-read': {
                        table: 'sys_security_acl'
                        id: '4f19609d13ca41a1a57e828680ad09d3'
                    }
                    'x_2236136_suiko_ai_legal_task-write': {
                        table: 'sys_security_acl'
                        id: '874c4d90ac974a40abf6ee44dfe62ee7'
                    }
                    'x_2236136_suiko_ai_review-create': {
                        table: 'sys_security_acl'
                        id: '7ee10878d3e542d8839c20ee62d6603f'
                    }
                    'x_2236136_suiko_ai_review-delete': {
                        table: 'sys_security_acl'
                        id: '57a717a971604f78b1af53809df00d14'
                    }
                    'x_2236136_suiko_ai_review-read': {
                        table: 'sys_security_acl'
                        id: '5d076b10572c481dabdcf708ec4110af'
                    }
                    'x_2236136_suiko_ai_review-write': {
                        table: 'sys_security_acl'
                        id: 'ed91c398bc844934af7f87bca889ab7a'
                    }
                    'x_2236136_suiko_ai_revision-create': {
                        table: 'sys_security_acl'
                        id: '3b74d6c203974175b36c0a38d1a54d49'
                    }
                    'x_2236136_suiko_ai_revision-delete': {
                        table: 'sys_security_acl'
                        id: 'cd7f7ca64e444ede965411fe745e38f7'
                    }
                    'x_2236136_suiko_ai_revision-read': {
                        table: 'sys_security_acl'
                        id: '4dc943813b2043b095e00926af1fd1cd'
                    }
                    'x_2236136_suiko_ai_revision-write': {
                        table: 'sys_security_acl'
                        id: 'c047760dd42f42f4b1a05d3a0e736426'
                    }
                    'x_2236136_suiko_ai_rule-create': {
                        table: 'sys_security_acl'
                        id: '6ffba026d6294cf1856b73a2777c7a26'
                    }
                    'x_2236136_suiko_ai_rule-delete': {
                        table: 'sys_security_acl'
                        id: '4af6cf7202744ec9a1419577e2646fca'
                    }
                    'x_2236136_suiko_ai_rule-read': {
                        table: 'sys_security_acl'
                        id: '8219690054ef460498a1fc2558c30d84'
                    }
                    'x_2236136_suiko_ai_rule-write': {
                        table: 'sys_security_acl'
                        id: 'bfa6b53aa0614b919652e3c14cafc3ec'
                    }
                    'x_2236136_suiko_ai_story-create': {
                        table: 'sys_security_acl'
                        id: '94f8ab4edeba4fd58b5c5e38a86071ef'
                    }
                    'x_2236136_suiko_ai_story-delete': {
                        table: 'sys_security_acl'
                        id: 'dd50bbcd54b54836846f52eb33ed8c6f'
                    }
                    'x_2236136_suiko_ai_story-read': {
                        table: 'sys_security_acl'
                        id: 'b3ea28b53386421fbe3d539fa8fec0c8'
                    }
                    'x_2236136_suiko_ai_story-write': {
                        table: 'sys_security_acl'
                        id: '17c39ad5d88844dc9fbd9e07c22187f0'
                    }
                }
                composite: [
                    {
                        table: 'sys_documentation'
                        id: '007c4ab227c142ef9a9ba3b01898cbef'
                        deleted: true
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'legal_change_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '00eda86a2e3b42febbe52c0db4df54aa'
                        key: {
                            document_key: 'a4629dd519dc427e8d24767579635c42'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_atf_test_suite_test'
                        id: '00fc71abb2d34830a6f6a97570b4c24c'
                        key: {
                            test_suite: '47a536e4837d4aee8793a15628adeffd'
                            test: '72c490995ac04698a726dcd67ccb54bb'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '01e69d3b18d642038014807e35292fbb'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '01fc0696b7d54b1f98b54525214d6ac0'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'protected_evidence'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: '0275bf9db96f477292b19236bbed59a1'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '030c1997681e400db40942512e206e0d'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'archived_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '03458ab051934cfb8b8288748ed809f4'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'content_kind'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '040191e889fe4893b94ed4b068225937'
                        key: {
                            sys_ui_section: {
                                id: 'a4d9f12d73cf43be9e086d382454ff87'
                                key: {
                                    name: 'x_2236136_suiko_ai_config'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'name'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '0441e9acb0b641f3b0156b52d7b85f0a'
                        key: {
                            document_key: 'c84c5f3d36be4f129ed2fbe49e9090b1'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '04a70c848b9f449da6d5811ca4d57261'
                        key: {
                            document_key: '677c43527dd44fb6bf779d1833bc786c'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '05c62cd729274745a8927fe470b98d65'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_rule'
                            col_name_string: 'rule_id'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '06571d01e126493c9adde659172e3205'
                        key: {
                            document_key: 'dc395843a1a14be5971fa3c0f6859477'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0690e121990b4de19e5f1f8e20661847'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'instruction'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '08046467493540c7aead8790fcec870f'
                        key: {
                            name: 'x_2236136_suiko_ai.rules_editor'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '08a2ef99bb2a463e98368c9cd4fed389'
                        key: {
                            document_key: 'dc395843a1a14be5971fa3c0f6859477'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: '08a9d4a9cb4549aaa48d4effc27ac1f4'
                        key: {
                            id: '48a7fca4b1f346548893cc2dde07a321'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '096bc67ff7a34e80b198561e2b59988b'
                        key: {
                            sys_ui_form: {
                                id: 'e04e6c651d3b476da1651d46c3ec5519'
                                key: {
                                    name: 'x_2236136_suiko_ai_story'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '4292850d4a92410593cb0de2727fc4b5'
                                key: {
                                    name: 'x_2236136_suiko_ai_story'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0974968a45fe4df1860477382b662eb4'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'saved_by_name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0980634c2a13413ab5b386797b389025'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'title'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '0a0e188d8ed546eca781229295a8a53d'
                        deleted: true
                        key: {
                            document_key: '4b4424d701c8421fb8368c4b6b43e847'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: '0b4ee0e88df241dea3efc58555836740'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: '0b993caa57654c4d89a886df561acf0a'
                        key: {
                            id: 'f3c2fb510f584c058bd2aae227595257'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0bfe1a09ff4a4ae58c7cc82536ec5607'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'decision_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '0c732a7c4b0c41a89ddb687718499152'
                        key: {
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'error_json'
                            position: '7'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '0ca1a74213384aa9a8d689f1d0fabb81'
                        key: {
                            document_key: 'fafcd4455d6e45809b4c47178c719ba5'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '0cb3f5173fd94430be0574314c815d49'
                        key: {
                            document_key: 'c84c5f3d36be4f129ed2fbe49e9090b1'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '0d1f86ccc5e44a7faa7a117707d16d6b'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'decision_by'
                            position: '11'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '0d266de6e40943a1b8deae7f218bbc8e'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: '0df8501e3b3e4907aebcb39f403dd7b0'
                        key: {
                            id: 'a3f47f147e294bcc839f81d46a278556'
                            table: 'var__m_atf_input_variable_071ee5b253331200040729cac2dc348d'
                            field: 'user'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0e34a68ca31f4f8095879a64b15816aa'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'priority'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '1016b61689bc4e76b9216c70628eb37b'
                        key: {
                            document_key: 'a3f47f147e294bcc839f81d46a278556'
                            variable: '586e2c4253e0220002c6435723dc3415'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '107adebb7d9d4df58c86dc02df4b573e'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'decided_at'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '10823aa1ffda4fd1be5957126a6df131'
                        key: {
                            application_file: '48510164b4f147b38b46687f256a3396'
                            source_artifact: '7917820115ab4b8ebe496dc17116fbea'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '10aabc31d1fa4f81b57d2a16addadee7'
                        key: {
                            sys_ui_section: {
                                id: '4292850d4a92410593cb0de2727fc4b5'
                                key: {
                                    name: 'x_2236136_suiko_ai_story'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'title'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '11a09947c58a4b6f8b6535c1b0a986e8'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'metadata_json'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '11ecdec13cd04a43ac7b77e2261285db'
                        key: {
                            document_key: '2badd1a4f8b44cd5a80dc89b6cd5ec2b'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '14b8c8e5c75549dda40c1240cfc3b9c8'
                        key: {
                            document_key: 'f3c2fb510f584c058bd2aae227595257'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '168812a567f9482ca4625fef749e9975'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'parent_rule'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '16b41c726b054422a20fd49c5d7b97ee'
                        key: {
                            document_key: 'f3c2fb510f584c058bd2aae227595257'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '174c077ee6c64bef9d83bfef667d3db8'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'archived_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '17db453e1e9e44b283e35c801a085a87'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'archive_change_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '17e189729dca432aad9c4de3df67cb62'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '18b393073b564b2a85433bceebc361ee'
                        key: {
                            document_key: '677c43527dd44fb6bf779d1833bc786c'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: '18f4bfcf301f4380bcf9782a12d0574c'
                        key: {
                            id: 'fc7a36aa6af64ee7b868cb15381c3d57'
                            table: 'var__m_atf_input_variable_071ee5b253331200040729cac2dc348d'
                            field: 'user'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '19daed1883294bc48fe835c7329303c4'
                        key: {
                            sys_security_acl: '42f8a819bca54b9b825e261e66b6b822'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '1a53fcfe7b36464ab1ab66e8a44e2c31'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '1b4d5591219b48ea9d81c0c9ac26d7b5'
                        key: {
                            document_key: '8fd30db97ed6492eb4f616a659e9645a'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '1d807ee2e5be4a43ab1861a56ad0f0fd'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'source_urls_json'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '1dfcadeadf9f490db376be098f646fd0'
                        key: {
                            sys_security_acl: '17c39ad5d88844dc9fbd9e07c22187f0'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '1ed8e1887a244a19bda8244a6348c921'
                        key: {
                            sys_ui_section: {
                                id: '54d42bb27b974fca829a81d43ca6e1fa'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'rule_id'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '1ee33b5aee08462990628180873fd5a3'
                        key: {
                            document_key: '48a7fca4b1f346548893cc2dde07a321'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '1fcf0347b55a4be4bbede7ebe6b51b0f'
                        key: {
                            document_key: '5b05a09e6e7e484292ab8a03212e066b'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '2084b78d1754423b8795b2b0825a8c26'
                        key: {
                            document_key: 'ecdb1b53f52c4721b6463926d78fea40'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '20ba2d593e9c4d719cb8bdd3e8185943'
                        key: {
                            sys_security_acl: '7ee10878d3e542d8839c20ee62d6603f'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '21209d9697f44de4a4433e2c4bb96820'
                        key: {
                            sys_security_acl: 'e1a7ca41408746df8e81f096760991f0'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '2249a0fe388e4e78b57c1e6fd1643785'
                        key: {
                            document_key: 'fafcd4455d6e45809b4c47178c719ba5'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '2295e7e4135f4332bb50032fb8cb9f93'
                        key: {
                            sys_security_acl: '94f8ab4edeba4fd58b5c5e38a86071ef'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '22ee66c0410349de99a1acd17d08f720'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'submitted_text'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '23c07026d6604015a63ef1dc14d65533'
                        key: {
                            document_key: 'dc395843a1a14be5971fa3c0f6859477'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '2457ac3d8df54f37afbf0f2e2bd7d7ae'
                        key: {
                            sys_ui_form: {
                                id: '9a47b15d63904b0a997b59c3cd2a7b08'
                                key: {
                                    name: 'x_2236136_suiko_ai_config'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: 'a4d9f12d73cf43be9e086d382454ff87'
                                key: {
                                    name: 'x_2236136_suiko_ai_config'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '259137c1d997464881585a11e6ff7566'
                        key: {
                            sys_security_acl: '3b74d6c203974175b36c0a38d1a54d49'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '25edbde0818741b7ab9f824777135ffb'
                        deleted: true
                        key: {
                            sys_security_acl: '874c4d90ac974a40abf6ee44dfe62ee7'
                            sys_user_role: {
                                id: 'c4a9ff1de6bc40959ff99bc8761e81c2'
                                key: {
                                    name: 'x_2236136_suiko_ai.legal_reviewer'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '26e6041de31644539c1e910ecf3b2b4c'
                        key: {
                            document_key: 'bbc9c869f7c44830b275738f335ec84d'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '271365404b1e48609dd91bdbe9e8aa32'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '27335f2ab5754c59a3b72dac8ed60e4f'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'disposable'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '2790cfe4bddf472e8a3d4ce1d451032a'
                        key: {
                            document_key: 'bf7c90ed4c0248318c78a162f7d5c43f'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '28da3560d424446eaf5a166c5dae1838'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'request_key'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '2a80d119ff91453aabfdf60535777db7'
                        deleted: true
                        key: {
                            document_key: '4b4424d701c8421fb8368c4b6b43e847'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '2b669131169a4336ab8dfa26ee38b69e'
                        key: {
                            document_key: '414b542c07a94dfeb5b9e47d2691258f'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '2bc671c172424bcc8ee7c3b32c4caf4c'
                        key: {
                            document_key: 'c84c5f3d36be4f129ed2fbe49e9090b1'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '2ca5bee9dc1845dbb45d7e206b56de3f'
                        key: {
                            sys_security_acl: '57a717a971604f78b1af53809df00d14'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2d23635f3f3446568b8625f4cf6a98cc'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'workflow_status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '2d7ad4055ce648069659aeac273e587a'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'version'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2ea8f32ea7a642888d2bf5b0b5c7fc4f'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '30079e6362f549118de55add7c508edb'
                        key: {
                            endpoint: 'x_2236136_suiko_ai_review.do'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3053f06cc8bd4616abad9039ef271f23'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'approval_json'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '305e788207de480e85fe6a11c2666318'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '306f199cbed6419d8aff2bb036f445f3'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'submitted_title'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '30b29dca919d4c779e0c6efd9f0a6463'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            caption: 'Details'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '31cee2561d3644f3bb5cd62a84207a7c'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'revision_diff_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '324ff2c47db649baaa638b5a05ea4aa4'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'submitted_title'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '3262bdfb72bd4e0fa1beb49f734e5f2e'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '32d4e05eb5124a73868004eec535dadb'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'notes'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '332e3f779d72473984293e339b4c6be4'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'version_key'
                            position: '2'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '338897cdd4b643eda2e98a53ed2a3f6e'
                        key: {
                            application_file: '380d9bee737b4405a278c64197aa5cdd'
                            source_artifact: '7917820115ab4b8ebe496dc17116fbea'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '347cb085519c49d49ff49c1774db08b6'
                        key: {
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'request_key'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '35f4ac8f5e074f65972392e5217d50c7'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'body'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '363f2c61a20441729fb731ce70d7d57d'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'request_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '36bf8212fdca4448b0ad95881b83a87a'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'decision_by'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '36c2d518ad0c4ca9bc5a2a3e4445db26'
                        key: {
                            document_key: '5b05a09e6e7e484292ab8a03212e066b'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '370a3fa5d5ba499ca27db677bc8474ad'
                        deleted: true
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'legal_change_key'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3796cfc70740449ca8a58ee1d593c518'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'requested_at'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '380d9bee737b4405a278c64197aa5cdd'
                        key: {
                            name: 'x_2236136_suiko_ai/main'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '3865384150f54769a53a38258b37e6a2'
                        key: {
                            document_key: '495b61f6e3794d1580467e3bed3fd2c5'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '38f024eab022407d8ba01a78daf7a0c4'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '38f6eb1199d6498da83aa6a063bec230'
                        key: {
                            document_key: 'fc7a36aa6af64ee7b868cb15381c3d57'
                            variable: '586e2c4253e0220002c6435723dc3415'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '399cdadef7884befb4b95623126f520a'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'model'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '3a0146b5530b485089ffbc689234bb3f'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'rule_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3a21482d75aa417e97e81ed2b42b799f'
                        key: {
                            sys_ui_section: {
                                id: '54d42bb27b974fca829a81d43ca6e1fa'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'instruction'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '3a2e65bbd86a4be4b91db67c183530d8'
                        key: {
                            document_key: '2f223d5e008a473baf352fe7e953a2ab'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '3b0feb9d1059452fb7df0cf46642ac24'
                        key: {
                            sys_security_acl: '45793d8bb4bf4cd08fbe2b9a7ce8839b'
                            sys_user_role: {
                                id: '08046467493540c7aead8790fcec870f'
                                key: {
                                    name: 'x_2236136_suiko_ai.rules_editor'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3b4e984c93b14da78de46b31bb13ea01'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'error_json'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3c18f3fce98c4f5cb5f791a9360c1f90'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'decided_at'
                            position: '12'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '3ccce4902e8d4ca792decfd9e497ecba'
                        key: {
                            document_key: 'bf7c90ed4c0248318c78a162f7d5c43f'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '3df0b720646d4d838b83bb1302c59fa7'
                        key: {
                            document_key: 'c84c5f3d36be4f129ed2fbe49e9090b1'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3f84ec86821742188711fedc168aa2dd'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'content_format'
                            position: '7'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '3fbd2c1136cd4e6bbcf3a04b2decafec'
                        key: {
                            document_key: 'bf7c90ed4c0248318c78a162f7d5c43f'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '415a7f5fb1dc45f190df34bd34b2a45d'
                        key: {
                            sys_ui_section: {
                                id: '7cdba13c0e4644c380fe2948be72b17a'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule_version'
                                    caption: 'Saved rule version'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'version_key'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '4179a8ec09d8421ba0e9d1a14364cdd3'
                        key: {
                            document_key: '2badd1a4f8b44cd5a80dc89b6cd5ec2b'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '421040f970e3477eb26d6ea54186c537'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'change_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '4292850d4a92410593cb0de2727fc4b5'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            caption: 'Details'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '42989c22ce224294b91c11d41c4063d2'
                        key: {
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'metadata_json'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '42cab74427a54f9ca56f568849850d7a'
                        key: {
                            document_key: '48a7fca4b1f346548893cc2dde07a321'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '432227d9371f49518dc1bc661e5eb4da'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'content_kind'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '43b1692bc4f54ab6ae60cfa1935018bd'
                        key: {
                            document_key: '065a5c18dfae4fd8a204dd8ff503d27b'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '43dfc711316141bcb103f4b1ca8e5665'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'request_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: '43fd3eb929074d2daa45823998695054'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '440638f669074b1b8681c7fa90695a0e'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '444f001ced4443259c9f52cd17b8a6ba'
                        key: {
                            document_key: '065a5c18dfae4fd8a204dd8ff503d27b'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '448ce256b4034129adf79bb61df13186'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            element: 'model'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '471e695a16fd4c3a9703f74d5657a3a0'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4748ff2e59c14dbca05a73bb1065d8a4'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'submitted_notes'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '47671bb318a5453a9b29053c40be1060'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'title'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '482fb142f7774cc4bd7d802598435e5b'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'disposable'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '48510164b4f147b38b46687f256a3396'
                        key: {
                            name: 'x_2236136_suiko_ai/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '49ec6304674442de85d5230d7851acd6'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'assigned_reviewer'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '49fb1cfd3944443d9bfc23d6685ef36b'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'disposable'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '49fe8864caad4292b522edc7c322548e'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'change_key'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4a142fca71d04c809bb984d0a9bdaadf'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'archive_change_key'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4a48e35830b5463092b8ed1344eba36c'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'title'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '4a500458f87540888cee03acef3a6871'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '4b929ecc09074536a3d0edf9e9346741'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '4b99b8167edb4a7c8b95c526aa6464e3'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'submitted_text'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '4bab42ff1de240fb93b51a9884c9794e'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'decision_note'
                            position: '7'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '4cedc007a1004c6fa151d7c096ed2680'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_revision'
                            col_name_string: 'version_key'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4d57db71f6ff476882e0e0b32d71ba47'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'title'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '4dae86cea03c4ec9bf35c1c0dd4bc8ed'
                        key: {
                            sys_security_acl: '357cb95843ec468ab844c472bbd8982a'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '4e1778e28688411c97f7a494ae825208'
                        key: {
                            application_file: '30079e6362f549118de55add7c508edb'
                            source_artifact: '7917820115ab4b8ebe496dc17116fbea'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '4f35147c8bc848f0b48a453bc5b086f3'
                        key: {
                            sys_ui_section: {
                                id: '7cdba13c0e4644c380fe2948be72b17a'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule_version'
                                    caption: 'Saved rule version'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'parent_rule'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '503b0d99967e4bf99a4fb3ccba582408'
                        key: {
                            sys_security_acl: '31a7cfd9003d4f23812e466afbb05eb1'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '5040b3bb720a410dace7d77146f9289b'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5040d59aed854373904f22b55868874c'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'draft_version_id'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '50a5c9e8a37d465a96e43cac1b8512ae'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'source_urls_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '50beb7ba48bb4e96bbd0b176c0e118db'
                        key: {
                            sys_ui_form: {
                                id: '0b4ee0e88df241dea3efc58555836740'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '519d215f6b254a06ba0ccbc713f6bd25'
                        key: {
                            document_key: '420e9ed5b97b487881f370ff8d62693d'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '52aa22c14ea145fa87aeb336c1379515'
                        key: {
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'model'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '52e08e5d3b9a4e0aaac44de1d4b0674c'
                        key: {
                            document_key: '015d524c077a49c9be04a837446f2ea6'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '52f6223dca43437aa20bd8914a5f4a94'
                        key: {
                            document_key: 'fafcd4455d6e45809b4c47178c719ba5'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '54551aa6a1e14a90bd14b60e0cf2137e'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_atf_test_suite_test'
                        id: '548ef4a8722f4b6d9bd31250fe9e9280'
                        key: {
                            test_suite: '47a536e4837d4aee8793a15628adeffd'
                            test: '7b400f128093414981ce5012abf21b96'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '54b4c98a967f420b88dbb255801b7b38'
                        key: {
                            document_key: '677c43527dd44fb6bf779d1833bc786c'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '54d42bb27b974fca829a81d43ca6e1fa'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            caption: 'Details'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '54ebc2dee5264c64afabc63787ac8ab0'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'protected_evidence'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '550fd7353d0042039d55132d33a35247'
                        key: {
                            document_key: '5b05a09e6e7e484292ab8a03212e066b'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '55dddc5e7ce54414ab64dc6faa613ebf'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'request_json'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '58943c3bc36a49e29df963d3b6911305'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '58f55484643a4a83b908477d0a2e7909'
                        deleted: true
                        key: {
                            document_key: '4b4424d701c8421fb8368c4b6b43e847'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '593be39fec3c4fa49c2369433d89995e'
                        key: {
                            document_key: 'a4629dd519dc427e8d24767579635c42'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '5978896cd199428d9e13a10cf7eeb027'
                        key: {
                            document_key: 'bf7c90ed4c0248318c78a162f7d5c43f'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '599a47951eff44fbae87a5f87b720433'
                        key: {
                            document_key: '496fe3120915413797d169dd7d12e29f'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '59f051cd6e4a4c249efe3d58305be36d'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'title'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '59f6d31928524bccb882d2f0c44ff29c'
                        key: {
                            document_key: 'c84c5f3d36be4f129ed2fbe49e9090b1'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5a65cf435e0a420a9e0a373d7bfff29f'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'decided_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5af10c490c9b4cd28370fc244ef0c982'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'body'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5b2b84deadbe4404b0c29e7cf928aee5'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'story'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '5b3f612433364d428446b820e7b96d20'
                        key: {
                            sys_security_acl: '7e5ccb6766c04d6ab73cd0d769c70dfa'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '5bb8b66c6f774fe2860f370870a40b35'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_policy_version'
                            col_name_string: 'request_key'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '5bc3bac8ed5a4b7e90f8d45d70667473'
                        key: {
                            name: 'x_2236136_suiko_ai.editor'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '5c6371720c784cc5b45e23d248ef3e2d'
                        key: {
                            sys_security_acl: 'dd50bbcd54b54836846f52eb33ed8c6f'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5cf254f15cab492091080a3839b8e351'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'archived'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: '5dc869ede7924acc9e50a26a9fe56364'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5f0a75b4eeaf4c619f5e40570aae29b5'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'status'
                            value: 'pending'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '60365f1e180a4ad5aa8c811f4001f6b0'
                        key: {
                            document_key: '2badd1a4f8b44cd5a80dc89b6cd5ec2b'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '60a947b0b02d45ab89809d120a8ca213'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'title'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '60c5a3adec6a4aea8a3caffb00fa5484'
                        key: {
                            document_key: 'fafcd4455d6e45809b4c47178c719ba5'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '613bbc2f8ba641ce833ae1e7e171504f'
                        key: {
                            document_key: 'dc395843a1a14be5971fa3c0f6859477'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '61464a669ada492788b31ff4720a9780'
                        key: {
                            document_key: '420e9ed5b97b487881f370ff8d62693d'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '615fd4b824b24b56ac158ad08afb47ea'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'story'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6190978bc25844bcbf43dc6f9600fbb9'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'current_revision'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '61a8163b20104f8798a8827dbf04c75d'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            element: 'api_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '61b42d95e70d4c558d5e1478c93a1456'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'status'
                            value: 'cleared'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '61d9f761644643b4b72d86c3d3462141'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'requested_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '61f983441b4d49e790bdc010e9292d6c'
                        key: {
                            sys_security_acl: '4f19609d13ca41a1a57e828680ad09d3'
                            sys_user_role: {
                                id: 'c4a9ff1de6bc40959ff99bc8761e81c2'
                                key: {
                                    name: 'x_2236136_suiko_ai.legal_reviewer'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '62138f8f5677482fa37e5ea6466772ba'
                        key: {
                            document_key: '065a5c18dfae4fd8a204dd8ff503d27b'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '6236a26012634d90bab7864f27bccdab'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'workflow_status'
                            value: 'waiting_for_legal'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '628e8d4d455940a88a81611879b35159'
                        key: {
                            document_key: '634e46f9335d4661b18ba51e9038e5d0'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '632a41840da641d4866e78eb6cd6a95b'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'decision_note'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '633829050fed4e8a8a1b9153403b9be2'
                        key: {
                            document_key: '5fc233390b6c42b189e729e4c4aa24a6'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '641768d6cfcf4bd88abff5125207eaf4'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: '643b37a3fd1e408493405cfd411b55d0'
                        key: {
                            id: '495b61f6e3794d1580467e3bed3fd2c5'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '64b155a73cff4d189b030d65afe85a48'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            caption: 'Legal review'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6526beb0a6144de79f3e41a76633cf31'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'priority'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '65c3c713648545e397c58e7b738b7094'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'request_key'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '665da84f277b41bb80f72c4c42370193'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'body'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '68538cc2b9804a62acc7877c5c2a43be'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            caption: 'Details'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '68744a6304234a1eb2fd9aecee0a7a72'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '68cb273b00444b6f9e2009bd20bf6b74'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'assigned_reviewer'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '69422a11aee04479b42cbb5d3b4d427b'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'approved_json'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '697e0f0c4a274670b99197ad4ac65bc9'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'source_evidence_json'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '69fde0ef04e54ae0bac39b01298e7157'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6a275f6667914af69493bcdb6594e606'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'archive_change_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '6aa17610afa045318e7349c4b5ad3ae2'
                        key: {
                            document_key: '4aa86055687045319023d3a1a297463c'
                            variable: '586e2c4253e0220002c6435723dc3415'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6ba575ac2ba047f19ced603ebe0ff455'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6cca55b49e084d9487c0e2b9ed4f7d14'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'reason'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6e73d03c95a04551a71ba4a21d326e70'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'version_key'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '6e7657ad04ab44c09b6ff9bdcaa12cb8'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4292850d4a92410593cb0de2727fc4b5'
                                key: {
                                    name: 'x_2236136_suiko_ai_story'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'workflow_status'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '6ea3a5a696524f6da69b033b92ee5bef'
                        key: {
                            document_key: '634e46f9335d4661b18ba51e9038e5d0'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6ebc29ff332a442c9e74e6374ae06f85'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'version_key'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6f6c932dfbe049c9822c83bf2380d216'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'parent_rule'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '70558a10b53d4e2387769c3b479f4d62'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '725ed03caf004b9896aba1ef9fef1c0d'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'archived_by'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '741412d6aa8f4844a6fd0c6064e68009'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'managed'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '74d48cf52b584c96b4d7e416dc478637'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'workflow_status'
                            value: 'ready_for_sign_off'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '754aec7aaac043ea941d314f6b219ba7'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'notes'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '75dc980252a749dbae6c90f0d90d99fd'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '761d797a8bbf4293899509a10b9113da'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'requested_by'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '762e2714171340339c7e043a05c65f27'
                        key: {
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'response_json'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '766a2c87b5fa4126bb2205fabd706634'
                        key: {
                            document_key: 'fafcd4455d6e45809b4c47178c719ba5'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '76903f7002494068bc4ad0c4f3f367a2'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7748e3a83388434dbe88d4bf38db9528'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'submitted_notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '77d1e3192d674dbe9664f35ce66ba001'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'approved_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '77e9abb5745b42d2b410e98b2869ec77'
                        key: {
                            document_key: 'dad2f839ba42417aba6f1b8840993d67'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: '7917820115ab4b8ebe496dc17116fbea'
                        key: {
                            name: 'x_2236136_suiko_ai_review.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7b9c4f039c6d4357bf69d1557c1c3340'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'source_evidence_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '7bc56de97f054c07a51f773ce47752bd'
                        key: {
                            document_key: '065a5c18dfae4fd8a204dd8ff503d27b'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '7c2311f552654d8094116114647e158d'
                        deleted: true
                        key: {
                            sys_security_acl: '357cb95843ec468ab844c472bbd8982a'
                            sys_user_role: {
                                id: '5bc3bac8ed5a4b7e90f8d45d70667473'
                                key: {
                                    name: 'x_2236136_suiko_ai.editor'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '7c2ce48d57a74debb42db9b44699bd84'
                        key: {
                            document_key: 'dad2f839ba42417aba6f1b8840993d67'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7c59d3dc9c804a10baad5cff84edcbb2'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'archived'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '7c810aa3b98f48eaacaa82213ff21162'
                        key: {
                            document_key: '49834f4b8f8d49979f8a5b43166970d8'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7c9933b82c424760905b84e85d4ef4cb'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'body'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '7cd7acd0016b47a9afad519c66c065bd'
                        key: {
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'state'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '7cdba13c0e4644c380fe2948be72b17a'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            caption: 'Saved rule version'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '7cde71c290f04d4c8225e3d89334fffd'
                        key: {
                            sys_ui_form: {
                                id: 'a9305ecb97c0412291baffc2b44e5860'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7d42db249f9143f1a2e7061f7bdd69a6'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'pending_key'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '7dcddee8d27e4b3d8aba2863eef551b1'
                        key: {
                            sys_ui_section: {
                                id: '4292850d4a92410593cb0de2727fc4b5'
                                key: {
                                    name: 'x_2236136_suiko_ai_story'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'current_revision'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7efcedf89f13416f94f717a795e30c7a'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'protected_evidence'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: '7facf1074ae64d1c9e06655a852db96f'
                        key: {
                            id: 'a4629dd519dc427e8d24767579635c42'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '80aa4b3993b14754a54cc8094d28e483'
                        key: {
                            document_key: 'ecdb1b53f52c4721b6463926d78fea40'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '80bc13a029e543ae823ccc388dd152ad'
                        key: {
                            document_key: '8fd30db97ed6492eb4f616a659e9645a'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '8110ff7b1653459eb1365d1a96eaad88'
                        key: {
                            document_key: '2f223d5e008a473baf352fe7e953a2ab'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '81ffb43dc10c4d57ba49b1962037ebf2'
                        key: {
                            sys_security_acl: '2a156e3011d24ff6a855adca50467973'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '82cc3039c18e477a8dd938543f3be428'
                        key: {
                            document_key: '420e9ed5b97b487881f370ff8d62693d'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: '83444db9f395467f8f42339e053d9e08'
                        key: {
                            id: 'fff3724f0940410899232e79d30335d6'
                            table: 'var__m_atf_input_variable_071ee5b253331200040729cac2dc348d'
                            field: 'user'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '83a40e65d35040409701748fdb093fa8'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '84e6520ef6a94d45ab5b67bbeb9b3fb2'
                        deleted: true
                        key: {
                            document_key: '4b4424d701c8421fb8368c4b6b43e847'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '86343c7a005d4de6b50671004aee3cf3'
                        key: {
                            sys_security_acl: '9c63ea80b8384b60b29e77aa3280512c'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '86749ec4b5ee46b38416a916681a34d7'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'error_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '8679079cc3734fe7bf49ecfde61b6e20'
                        key: {
                            sys_security_acl: '20963560e7464e71ab6472bd498c6f08'
                            sys_user_role: {
                                id: '5bc3bac8ed5a4b7e90f8d45d70667473'
                                key: {
                                    name: 'x_2236136_suiko_ai.editor'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '8691676b4e7949d4bf06cf908e9a2887'
                        key: {
                            document_key: 'ecdb1b53f52c4721b6463926d78fea40'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '86fe724059ec46aa9889ff181f1ab29e'
                        key: {
                            sys_security_acl: '6ffba026d6294cf1856b73a2777c7a26'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8737d2b371d24bf2b1e2b07a3ab50b30'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'archive_change_key'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8850a3c742de475fa5315e52203d46cc'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'submitted_text'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '88a18d8ba327428baf0c0b848c9f8327'
                        key: {
                            sys_ui_section: {
                                id: '54d42bb27b974fca829a81d43ca6e1fa'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'version'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_user_role_contains'
                        id: '88c8c1c71046444f9c22fb64c5f4a9cb'
                        key: {
                            role: {
                                id: '08046467493540c7aead8790fcec870f'
                                key: {
                                    name: 'x_2236136_suiko_ai.rules_editor'
                                }
                            }
                            contains: {
                                id: '5bc3bac8ed5a4b7e90f8d45d70667473'
                                key: {
                                    name: 'x_2236136_suiko_ai.editor'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '8a58188880ca4ab88e9522a506f80ec8'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'status'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '8ad5fcafd07745539b19f6f2150c27b6'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_legal_task'
                            col_name_string: 'revision'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '8bb4159319f447c78fb5f9ab484349f1'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'body'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '8bcdac71cb02407e969dab31c71e0c99'
                        key: {
                            document_key: 'a8edb3b62f394be3b4775358f6047c8b'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8beedfd517734abb81c4f5c65a9df5fa'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'archived_at'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8c8d2364e53344ea8912a061ea263e8e'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '8e154b04c116498283032226bdc33041'
                        key: {
                            document_key: 'fff3724f0940410899232e79d30335d6'
                            variable: '586e2c4253e0220002c6435723dc3415'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8e62bd0cecda4da9aa8b1579d0b9e8f8'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'title'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8e7b9996191f41d2a8e0603ac93da7a5'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'content_format'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '8ecce163cff9477b93e426f1efaa7fad'
                        key: {
                            sys_ui_section: {
                                id: '54d42bb27b974fca829a81d43ca6e1fa'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'title'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '9138f1e36d9c4b999117212443b6e73a'
                        key: {
                            sys_security_acl: 'ed91c398bc844934af7f87bca889ab7a'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '913a1520f6da46bfa292fed7b003fd77'
                        key: {
                            document_key: '420e9ed5b97b487881f370ff8d62693d'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '91c0797e05794e9795e75ad465ac4347'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'requested_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '935065d4434749109932644f7303612e'
                        key: {
                            document_key: '7a8a87187fdd4b1e91cd8162e58333a2'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '93f8d5ea95d44b2c911a16441cef80c8'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'archived'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9517753e4524495fb10cf6a92669ebf9'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'decision_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '95317d4e51034aa8b0102e8a3ec1632a'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_review'
                            col_name_string: 'active_revision'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '95c38c51e0a44c83ac31b2335caa0cdc'
                        key: {
                            sys_ui_section: {
                                id: '54d42bb27b974fca829a81d43ca6e1fa'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'priority'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: '9665cc2c6c484cdda1b8fd26e68f28ec'
                        key: {
                            id: '49834f4b8f8d49979f8a5b43166970d8'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '969f1fd68079491495cb7ce67ee33c2d'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'model'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '97dee6ad68b94c0288f165c0ea72f075'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'active_revision'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '980c5b2b5d814b41b4872d7295b30ce2'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'archived_at'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '986ea768c8194ba6b801ed3cc756d61f'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'response_json'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '989a46eca6db49f09fbf43c1c3506f97'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'metadata_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '991b1c4e1eab41c1beb07a353e97cac6'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'source_urls_json'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '9936f7ca15f449b39b79a65e2d0e897b'
                        key: {
                            sys_security_acl: '874c4d90ac974a40abf6ee44dfe62ee7'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '999cd34111e4474b80cae2ff2122b99c'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'status'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '99b1742574574353807d3133cd8f5b04'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '9a15db702d80488aa9ca04bde9fd80b4'
                        key: {
                            document_key: '5fc233390b6c42b189e729e4c4aa24a6'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: '9a47b15d63904b0a997b59c3cd2a7b08'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9bfb169e602a4302bf9f08320f09d9a1'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'archived_by'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '9c14f85e248e460babf8bb997ab08a55'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'requested_at'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9d2a8ccec7c745ebab0b538e10420fea'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9d3bb96dcd64439cb92124b4951d5b45'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: '9d514706d511456eb0368a4982df39f7'
                        key: {
                            document_key: 'fafcd4455d6e45809b4c47178c719ba5'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9e09315cbfe44af3a2b57d4502143046'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'request_key'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9fa375eb82ed4798b89a081870d2fcfa'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'a04a46c68e174c29af6f34e2d52504e1'
                        key: {
                            sys_ui_section: {
                                id: '7cdba13c0e4644c380fe2948be72b17a'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule_version'
                                    caption: 'Saved rule version'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'approval_json'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'a11a5b490a874d468d16437e658a214b'
                        key: {
                            sys_ui_section: {
                                id: 'a4d9f12d73cf43be9e086d382454ff87'
                                key: {
                                    name: 'x_2236136_suiko_ai_config'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'model'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'a18833deac504124b0053f2d3f9700fa'
                        key: {
                            sys_security_acl: 'ad7efc360ac94b8cbd160b45295cfc40'
                            sys_user_role: {
                                id: '5bc3bac8ed5a4b7e90f8d45d70667473'
                                key: {
                                    name: 'x_2236136_suiko_ai.editor'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'a1d28045f67f421daf02cba726f14cc8'
                        key: {
                            document_key: 'ecdb1b53f52c4721b6463926d78fea40'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a261f0b528d6426c903c86d5653f7f76'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'saved_by_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'a38d36e9931f49419f8c483a0e3300ca'
                        key: {
                            sys_ui_section: {
                                id: '54d42bb27b974fca829a81d43ca6e1fa'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'active'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a3e36f8f30f64ab9989596e34c415800'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: 'a4d9f12d73cf43be9e086d382454ff87'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            caption: 'Details'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a63c5d2707504b18bd75c1edc104fa35'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'content_kind'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'a7de66b349f14a29ac75f6c4f3ee60bf'
                        key: {
                            sys_security_acl: 'cd7f7ca64e444ede965411fe745e38f7'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a8ea515071a94b288aaea3026c1c7908'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'decision_key'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: 'a9305ecb97c0412291baffc2b44e5860'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'aac72dcbf8b24317801593387ece69a3'
                        key: {
                            document_key: 'ecdb1b53f52c4721b6463926d78fea40'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'ab692bdeac254eb1b3e75123c63381e1'
                        key: {
                            document_key: 'a8edb3b62f394be3b4775358f6047c8b'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'abadbe73e57c4c27bb0731c24a14c3bf'
                        key: {
                            sys_security_acl: '0dfb37cdc838416babab7cc87e40eb6c'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'abb2e82b96ac4b86bd091057e9f29c3e'
                        key: {
                            document_key: 'dc395843a1a14be5971fa3c0f6859477'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ac2241379b5440bd8afd13e67cb1ac00'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'title'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'ac6f4f1975044d2683afaa43244f0009'
                        key: {
                            document_key: 'c84c5f3d36be4f129ed2fbe49e9090b1'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'ac7c8c9a1e974d0aa14586e076d7bcf6'
                        key: {
                            document_key: 'bbc9c869f7c44830b275738f335ec84d'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'ac8cedd00772491393ec21dd2a4274b0'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'decided_at'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'acc88a8a85d64d84aed8ae465958e524'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'version'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'ad6e84fac0c5469fab34e6ca8715926e'
                        key: {
                            document_key: '677c43527dd44fb6bf779d1833bc786c'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ae10e6acca034ad5968e2047d3e0061f'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'rule_id'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'aea081dfa8774df08b4bb820ae867d67'
                        key: {
                            document_key: '414b542c07a94dfeb5b9e47d2691258f'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'aea51e83a7d44fe9862d0f9e5f0ff383'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_rule_version'
                            col_name_string: 'version_key'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'aec92464ee724eadb6188c4c0af1fe26'
                        key: {
                            document_key: '0589ac4d798444f3bd7e7c8a81172849'
                            variable: '586e2c4253e0220002c6435723dc3415'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'aeeed80b6e4d4bf9a2e5117cb58f2b2e'
                        key: {
                            document_key: '7a8a87187fdd4b1e91cd8162e58333a2'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'aefa62dc919341579fb5aacf65e0a8e4'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'workflow_status'
                            value: 'changes_requested'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'af17c2059da04c41a806c2e2d6de1589'
                        key: {
                            document_key: '496fe3120915413797d169dd7d12e29f'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'af7bed45f02340f0bbbf37388458c64a'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'revision'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'b01cfa9b08944421a397b8c9f1ebb04c'
                        key: {
                            sys_security_acl: '1107aa35ffb74eb9bc36a9f35d981800'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'b05c4bd8fb9e46c2a91b1bed7f09a2f6'
                        key: {
                            sys_security_acl: 'b3ea28b53386421fbe3d539fa8fec0c8'
                            sys_user_role: {
                                id: '5bc3bac8ed5a4b7e90f8d45d70667473'
                                key: {
                                    name: 'x_2236136_suiko_ai.editor'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b0fc999f709c448e8b1968b95219764a'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'protected_evidence'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'b1673cb3144f4fa4988e56f3d6089ad2'
                        deleted: true
                        key: {
                            document_key: '4b4424d701c8421fb8368c4b6b43e847'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'b1fc3eb3cefd486f925f1b735c84cbcc'
                        key: {
                            sys_security_acl: '8219690054ef460498a1fc2558c30d84'
                            sys_user_role: {
                                id: '5bc3bac8ed5a4b7e90f8d45d70667473'
                                key: {
                                    name: 'x_2236136_suiko_ai.editor'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b35a1e8cb930455f8eb54eabe92d4eb0'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'active_revision'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'b41e67a46cd3467caf3c525650b2a7a5'
                        deleted: true
                        key: {
                            document_key: '4b4424d701c8421fb8368c4b6b43e847'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b439514c7a9c42d48f32d6face88c85d'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'definition_json'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b47f8ab94a0b4bdd9f51c91be1603c72'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'revision'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'b5437ad3fcb341d38e183a64258c4f82'
                        key: {
                            document_key: '49834f4b8f8d49979f8a5b43166970d8'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'b5a95f0534c841038d21e1c029d4bbd6'
                        key: {
                            document_key: '677c43527dd44fb6bf779d1833bc786c'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'b61dc612471d4535971f5faaa81820b6'
                        key: {
                            sys_ui_section: {
                                id: '7cdba13c0e4644c380fe2948be72b17a'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule_version'
                                    caption: 'Saved rule version'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'version'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'b6442e01263742d0bc1081808ab3ee51'
                        key: {
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'request_json'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b7536a4a7ccf48d28801d8bf5381249f'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'version'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b76d38d59d8d49bd80ad8a1f46378ada'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'draft_version_id'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'b8359b580b604f7fb6303e87313e9938'
                        key: {
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'revision'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'b84991331e334935bf62691d31a186ee'
                        key: {
                            document_key: 'ecdb1b53f52c4721b6463926d78fea40'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'b9b58ce3d3a84f6bbc864b8085e69a34'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'workflow_status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ba137d776be54b8f930ee20fab35e9a5'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'reason'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'ba3b8d3bb8de4674b3b40ee435ceb277'
                        deleted: true
                        key: {
                            document_key: '4b4424d701c8421fb8368c4b6b43e847'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'ba907bc39866450b95aa3ca4f2188f0a'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'ba9af77fee304adab4cd58e134bd5bfe'
                        key: {
                            sys_security_acl: '5d076b10572c481dabdcf708ec4110af'
                            sys_user_role: {
                                id: '5bc3bac8ed5a4b7e90f8d45d70667473'
                                key: {
                                    name: 'x_2236136_suiko_ai.editor'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'bae88ccac8634ec38a87915364da45d1'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'submitted_notes'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'bae9cf858259426c99452a5df979cdb2'
                        key: {
                            document_key: '2badd1a4f8b44cd5a80dc89b6cd5ec2b'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'bb6cc9abd27947e0a8ed5d0b5d4721b5'
                        key: {
                            document_key: '677c43527dd44fb6bf779d1833bc786c'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'bb7033fb3c994a53a9341324dc6a46e7'
                        key: {
                            sys_security_acl: '0f84e0da476447659961acc381cbf3f7'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'bb8e5ebc6494489f8e065306e4164b47'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'revision'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: 'bc85a89ef3c14fbca35538056328b9f2'
                        key: {
                            sys_ui_form: {
                                id: '5dc869ede7924acc9e50a26a9fe56364'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '54d42bb27b974fca829a81d43ca6e1fa'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'bc943501c86f43beb14e6f4cf6230459'
                        key: {
                            document_key: '677c43527dd44fb6bf779d1833bc786c'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'bf7b04e51eb6421ca4c6c7c8949845ed'
                        key: {
                            sys_ui_section: {
                                id: 'a4d9f12d73cf43be9e086d382454ff87'
                                key: {
                                    name: 'x_2236136_suiko_ai_config'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'api_key'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bfef3da618c54c80bf1ea6158b2ab489'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c2a541f422ad4538ba9ca4af4bc6ec5d'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c3415fe89adf4b7fa5f6fc2c7189d1d5'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'c3c18f941ac248a4806e73ed71ac8209'
                        key: {
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'active_revision'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'c4a9ff1de6bc40959ff99bc8761e81c2'
                        key: {
                            name: 'x_2236136_suiko_ai.legal_reviewer'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'c51f32c236ca4ff594b9afbe30460c19'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c5b06f63f9ac4276b6731b7dc1b18f8b'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'archived'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'c5fabe7754e14b3c934e89b9cd0ec442'
                        key: {
                            sys_security_acl: '0740c2d768054b7c91123c86973f130a'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'c65535fac1754fa5849dd9ba6eb29c3e'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'requested_at'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'c6a8f832e6084db089b4d1535cc973e7'
                        key: {
                            document_key: '5b05a09e6e7e484292ab8a03212e066b'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'c6bccfbebbf049599a6d7287b1912eb3'
                        key: {
                            sys_ui_section: {
                                id: '68538cc2b9804a62acc7877c5c2a43be'
                                key: {
                                    name: 'x_2236136_suiko_ai_revision'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'story'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c6c11b5115bb440a9bc19c5a7ab6f2ae'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'revision_diff_json'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c6eec8b1a86544ac94d48317a336182e'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'current_revision'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'c80277213bbd421eb0e73094b2df97f4'
                        key: {
                            document_key: 'ecdb1b53f52c4721b6463926d78fea40'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'c926ed1c216545ecb6bd4e2bdb89df44'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_review'
                            col_name_string: 'request_key'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'cba1c33f6a04492f87ea594257d2b58d'
                        key: {
                            document_key: '5b05a09e6e7e484292ab8a03212e066b'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'cbbe1b9f90224b998cc26e513f740804'
                        key: {
                            sys_security_acl: 'bfa6b53aa0614b919652e3c14cafc3ec'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'cbc5b284ff0f4f09bcce1c435329f501'
                        key: {
                            document_key: 'fafcd4455d6e45809b4c47178c719ba5'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cc3ca6c77a7d48279c4dbde89bafc1d4'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'approval_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'ccb7cfee8afb4315919039bc9257aa77'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cd35fdc6cb6a40c49401b5fbd8b275ed'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'story'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'cdae08d7b9f74a299ac96ce2340005ad'
                        key: {
                            document_key: '065a5c18dfae4fd8a204dd8ff503d27b'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: 'ce91b8dc7ff342a89a9dad784c31cc1e'
                        key: {
                            id: 'd4e25587d7d84782b828c9d87e3a088c'
                            table: 'var__m_atf_input_variable_071ee5b253331200040729cac2dc348d'
                            field: 'user'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cf79de7e7925425da04168818884bebd'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'request_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: 'cf8a726d84df4110b1224f9575ee36a0'
                        key: {
                            sys_ui_form: {
                                id: '0275bf9db96f477292b19236bbed59a1'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule_version'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '7cdba13c0e4644c380fe2948be72b17a'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule_version'
                                    caption: 'Saved rule version'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'd02bf2352f394c408422c0a77654fe51'
                        key: {
                            document_key: '065a5c18dfae4fd8a204dd8ff503d27b'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd0b0fe16244749a89efc9971e7de9831'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'version'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: 'd12eb44f85684a229b58a535fbbe2f5f'
                        key: {
                            id: '0589ac4d798444f3bd7e7c8a81172849'
                            table: 'var__m_atf_input_variable_071ee5b253331200040729cac2dc348d'
                            field: 'user'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'd288eeb6380d4703a10cfa2b01114b47'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_config'
                            col_name_string: 'name'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'd2f27a2f26054bb698e86fda531ed7be'
                        key: {
                            document_key: '420e9ed5b97b487881f370ff8d62693d'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'd46f2ebfc91e45838c4a370e94f450b8'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd5c387f0c4bf41f2bceb27e081c944fa'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'title'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd5cca693aace405f8cb79fb1631d63d0'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'assigned_reviewer'
                        }
                    },
                    {
                        table: 'sys_atf_test_suite_test'
                        id: 'd61ecb5966d74609b7ab82e341f16695'
                        key: {
                            test_suite: '47a536e4837d4aee8793a15628adeffd'
                            test: 'bc1ff42900414effb460ce548213baf3'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: 'd6234b99723d40cd88ec20eaf88846db'
                        key: {
                            sys_ui_form: {
                                id: '43fd3eb929074d2daa45823998695054'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '30b29dca919d4c779e0c6efd9f0a6463'
                                key: {
                                    name: 'x_2236136_suiko_ai_review'
                                    caption: 'Details'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd6654af8da214bfa94c69633465365a5'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'version_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'd6ba86a56c5f4b73b2c4b50ef0e94450'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'requested_by'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd763b9387ffb4d4b8ca9aececae7712c'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'managed'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'd7fc2a56478249e29fabdc4747693170'
                        key: {
                            document_key: '2badd1a4f8b44cd5a80dc89b6cd5ec2b'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd8175061fb9d4364beafbeefa292f5ac'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'response_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'd8291eb15d0a400a9a33a16b51aae59a'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'submitted_title'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'd84d122f7af342618c984d3172ea3ef6'
                        key: {
                            sys_security_acl: '4cb214ff8ffa44a28355f41390ba4f7b'
                            sys_user_role: {
                                id: 'c4a9ff1de6bc40959ff99bc8761e81c2'
                                key: {
                                    name: 'x_2236136_suiko_ai.legal_reviewer'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'd897db91e40643c1b5fe40c2a7b58892'
                        key: {
                            document_key: '2badd1a4f8b44cd5a80dc89b6cd5ec2b'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'd8b3c57c9f4a49ab957bc8572af3619a'
                        key: {
                            document_key: '5b05a09e6e7e484292ab8a03212e066b'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'd9697a878d674f1084ff34099b2368cd'
                        key: {
                            document_key: '16d89eadfd87475db523e06677aa6fc8'
                            variable: '42f2564b73031300440211d8faf6a777'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'da6dbaf3a123496eb42adc995cd60b6a'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'decision_note'
                            position: '10'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'da9ccef1ee4540548bf51c8feda7f74c'
                        key: {
                            sys_security_acl: 'c047760dd42f42f4b1a05d3a0e736426'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'daaf436d71ec41658170b3066f733928'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'dafbd33fcb5c4946a7ffbff6200e8473'
                        key: {
                            sys_security_acl: '4af6cf7202744ec9a1419577e2646fca'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'dc7d61f8bc514f7e86c6545060be2750'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'reason'
                            position: '7'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'dce8c05acd00466a93d28a7a090dedc4'
                        key: {
                            document_key: '420e9ed5b97b487881f370ff8d62693d'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dd636c1a61e14bee9592fb85fe29f218'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'archived_at'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'de7a9a0791e14debbaa73103d6f13d08'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'df0ce49859e446bcaf0575f0ba2ee50e'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'notes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'df3e0abc223a4bccb7c4a8eec668f1f2'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'request_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'e0422a586f974c52bd3201810d9fe59b'
                        key: {
                            document_key: 'dc395843a1a14be5971fa3c0f6859477'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: 'e04e6c651d3b476da1651d46c3ec5519'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e0c92cca57984ad1b76d71860f1294a0'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'status'
                            value: 'changes_requested'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'e1f25d2b3ea0430eaea226e2c50fe549'
                        key: {
                            document_key: 'bf7c90ed4c0248318c78a162f7d5c43f'
                            variable: '1778a7480f20101091d0f00c97767e03'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e290ca1ad29c431ba39e072d0c4889eb'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'assigned_reviewer'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e341102326694e0dad94756fb417fadd'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'workflow_status'
                            value: 'signed_off'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'e395a30c6d0947469a3329ec9cd30cd9'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'decision_note'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: 'e3a16b09aa65452a9bcec059595d422d'
                        key: {
                            id: '4aa86055687045319023d3a1a297463c'
                            table: 'var__m_atf_input_variable_071ee5b253331200040729cac2dc348d'
                            field: 'user'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'e4e9ac0d9c174cfa97f371eeac7a39a0'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_legal_task'
                            col_name_string: 'assigned_reviewer'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e631b8cb5f1d48afba4955010e3947b3'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'reason'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'e63e89599c9e4aea8c80120f90191003'
                        key: {
                            document_key: '065a5c18dfae4fd8a204dd8ff503d27b'
                            variable: 'ff06ab840f20101091d0f00c97767e6d'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'e71b082720bf469893c89739efc9a799'
                        key: {
                            document_key: 'd4e25587d7d84782b828c9d87e3a088c'
                            variable: '586e2c4253e0220002c6435723dc3415'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e8a21be31a894b638ce3cb47dc149b3d'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                            element: 'content_format'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_atf_test_suite_test'
                        id: 'e8e76e426be04df4bd2c50fb8a76eaa0'
                        key: {
                            test_suite: '47a536e4837d4aee8793a15628adeffd'
                            test: 'af3df7b4fe8d4bea80920398d3d87b79'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'ebb419debc0040a6866be6909bc1a9e9'
                        key: {
                            document_key: '015d524c077a49c9be04a837446f2ea6'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'ec081abdc3724b9382dad4e33aa6593b'
                        key: {
                            document_key: 'bf7c90ed4c0248318c78a162f7d5c43f'
                            variable: '8c07aba5ff6033008d3f5d9ad53bf13b'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ec987f21184745f79e8f84db0e8426eb'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'revision'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'ecf0b3b15ae3475f8d1e2e100c1fc548'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'f01bd6d009fd4b35ba3408c0603d9705'
                        key: {
                            sys_ui_section: {
                                id: '7cdba13c0e4644c380fe2948be72b17a'
                                key: {
                                    name: 'x_2236136_suiko_ai_rule_version'
                                    caption: 'Saved rule version'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'definition_json'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'f0c193ffbbe841aab0c0c95894695a0b'
                        key: {
                            sys_security_acl: '4dc943813b2043b095e00926af1fd1cd'
                            sys_user_role: {
                                id: '5bc3bac8ed5a4b7e90f8d45d70667473'
                                key: {
                                    name: 'x_2236136_suiko_ai.editor'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f1005e17f15e43e9a53a5f060bc2d0e3'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'disposable'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'f2553371c9554206af344b98ccb436c9'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_legal_task'
                            col_name_string: 'pending_key'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f2966e43e6e8452fa14b16fdb044e24c'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'story'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'f3034e7d79d34c81a5adfaeeef74b9b7'
                        key: {
                            document_key: 'dc395843a1a14be5971fa3c0f6859477'
                            variable: '98c44875ffa033008d3f5d9ad53bf1fa'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f37073c8293245749b26b0b615ce28c1'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            element: 'api_key'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'f370e34958b349dbb38bbfac6139f2a6'
                        key: {
                            document_key: 'bf7c90ed4c0248318c78a162f7d5c43f'
                            variable: '6f69fc4aff6433008d3f5d9ad53bf18c'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f3724e71c7d048d99c36ed928fcb7976'
                        key: {
                            name: 'x_2236136_suiko_ai_config'
                            element: 'model'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'f3fb4131b0ae40d6a4f06b7d4808e316'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f456abbf6d0845b9abda130c33a6725d'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'revision'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'f474e77bfb274e3a8f9b65fcb8164678'
                        key: {
                            sys_ui_section: {
                                id: '64b155a73cff4d189b030d65afe85a48'
                                key: {
                                    name: 'x_2236136_suiko_ai_legal_task'
                                    caption: 'Legal review'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'story'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f56589c4d02d445fb3a294e7590a2c8f'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'decision_by'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f5d9a362b55e49368633ca43a854833f'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'definition_json'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'f70301c431754510bc5a447ec8c8c86a'
                        key: {
                            logical_table_name: 'x_2236136_suiko_ai_revision'
                            col_name_string: 'request_key'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: 'f707f284ff6142ecbeb7d8f515bae0e9'
                        key: {
                            id: '015d524c077a49c9be04a837446f2ea6'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f749b8ee704740fc97ea760e8ba78881'
                        key: {
                            name: 'x_2236136_suiko_ai_review'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f845e6a6393e44958b7f2971bbb25832'
                        key: {
                            name: 'x_2236136_suiko_ai_rule_version'
                            element: 'version_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f8abf211eab1485a9adcb520efca1e7b'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'requested_by'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'f92ed30ca7754b59b68907886195e043'
                        key: {
                            document_key: '5b05a09e6e7e484292ab8a03212e066b'
                            variable: 'b27b2b29ff6033008d3f5d9ad53bf164'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: 'f95d8e7c3e4c44da900395b617f2b741'
                        key: {
                            id: '2f223d5e008a473baf352fe7e953a2ab'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'f9b8b7e905f64a6690aaeb744c77d8a6'
                        key: {
                            sys_security_acl: '8012248e3a384fd0aa77427bd9d832fc'
                            sys_user_role: {
                                id: 'c1bf336a905849689b79cae5fc8d997f'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'f9babdcbc1b74c3baf57c66e52425034'
                        key: {
                            document_key: '420e9ed5b97b487881f370ff8d62693d'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f9cb926d3ed448708df6fb91bd1b0508'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fa0097dcdbc1482e96fa80aec4fa077a'
                        key: {
                            name: 'x_2236136_suiko_ai_rule'
                            element: 'instruction'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fa9a888d5d7c48d39bd456d1dd176c7a'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'workflow_status'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'fae505064738436ab2872e891bf74e9c'
                        key: {
                            name: 'x_2236136_suiko_ai_revision'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'faf79e9da71f46899b0c92622b4d5d77'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'archived_by'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'fb2b5d6b51dc4ce2b0087c105621f8a2'
                        key: {
                            document_key: 'c84c5f3d36be4f129ed2fbe49e9090b1'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fbc819638bb24d44bf7e0233dc3b85ff'
                        key: {
                            name: 'x_2236136_suiko_ai_policy_version'
                            element: 'request_key'
                        }
                    },
                    {
                        table: 'sys_element_mapping'
                        id: 'fc13b72f702d42d59d06d9b4c3dfba8e'
                        key: {
                            id: '16d89eadfd87475db523e06677aa6fc8'
                            table: 'var__m_atf_input_variable_41de4a935332120028bc29cac2dc349a'
                            field: 'script'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'fc83ad936dfd4db2b46c3bf73349eae6'
                        key: {
                            document_key: '495b61f6e3794d1580467e3bed3fd2c5'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'fcc68929c3cb43288620bc8cbbefe642'
                        key: {
                            document_key: '16d89eadfd87475db523e06677aa6fc8'
                            variable: '989d9e235324220002c6435723dc3484'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fd17f82879184d3797b77428296745bc'
                        key: {
                            name: 'x_2236136_suiko_ai_story'
                            element: 'workflow_status'
                            value: 'needs_review'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'fe468dda584640928ee233ee9671d9fe'
                        key: {
                            name: 'x_2236136_suiko_ai_legal_task'
                            element: 'pending_key'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_variable_value'
                        id: 'fe9573aed72741aa8c972758dc77df3f'
                        key: {
                            document_key: '2badd1a4f8b44cd5a80dc89b6cd5ec2b'
                            variable: '1985e0ceff2433008d3f5d9ad53bf1ba'
                        }
                    },
                ]
            }
        }
    }
}
