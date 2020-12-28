
#include <assert.h>
#include <string.h>
#include <stdio.h>
#include <tree_sitter/api.h>

extern "C" TSLanguage *tree_sitter_pyrope();

int main() {
  // Create a parser.
  TSParser *parser = ts_parser_new();

  ts_parser_set_language(parser, tree_sitter_pyrope());

  // Build a syntax tree based on source code stored in a string.
  const char *source_code = "%out = foo(1,4)\n xx = 3";
  TSTree *tree = ts_parser_parse_string(
    parser,
    NULL,
    source_code,
    strlen(source_code)
  );

  // Get the root node of the syntax tree.
  TSNode root_node = ts_tree_root_node(tree);

#if 0
  // Get some child nodes.
  TSNode array_node = ts_node_named_child(root_node, 0);
  TSNode number_node = ts_node_named_child(array_node, 0);

  // Check that the nodes have the expected types.
  assert(strcmp(ts_node_type(root_node), "document") == 0);
  assert(strcmp(ts_node_type(array_node), "array") == 0);
  assert(strcmp(ts_node_type(number_node), "number") == 0);

  // Check that the nodes have the expected child counts.
  assert(ts_node_child_count(root_node) == 1);
  assert(ts_node_child_count(array_node) == 5);
  assert(ts_node_named_child_count(array_node) == 2);
  assert(ts_node_child_count(number_node) == 0);
#endif

  // Print the syntax tree as an S-expression.
  char *string = ts_node_string(root_node);
  printf("orig tree   : %s\n", string);

#if 0
  TSInputEdit edit;
  edit.start_byte = 16; // Long_val(vStartByte);
  edit.old_end_byte = 22; //Long_val(vOldEndByte);
  edit.new_end_byte = 23; // Long_val(vNewEndByte);

  edit.start_point.row = 1; // Long_val(vStartLine);
  edit.start_point.column = 0;
  edit.old_end_point.row = 2; // Long_val(vOldEndLine);
  edit.old_end_point.column = 0;
  edit.new_end_point.row = 2; // Long_val(vNewEndLine);
  edit.new_end_point.column = 0;

  TSTree *ret = ts_tree_copy(tree);

  ts_tree_edit(ret, &edit);
#endif

  // Print the syntax tree as an S-expression.
  char *string = ts_node_string(root_node);
  printf("patched tree: %s\n", string);

  ts_tree_print_dot_graph(tree, stderr);

  // Free all of the heap-allocated memory.
  free(string);
  ts_tree_delete(tree);
  ts_parser_delete(parser);
  return 0;
}

// gcc -I ../tree-sitter/lib/include/ driver_test.cpp ./src/parser.c ../tree-sitter/libtree-sitter.a -o driver_test

